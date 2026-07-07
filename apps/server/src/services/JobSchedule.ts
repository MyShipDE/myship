import {TrackService} from "./VDR/TrackService";
import {ElectricityConsumptionService} from "./ElectricityConsumptionService";
import cron from 'node-cron';
import {CustomEvent} from "./CustomEvent";
import {DeviceService} from "./deviceService";
import {SignalKHelper} from "./helpers/SignalKHelper";
import {EngineHourMeterService} from "./EngineHourMeterService";
import {Log} from "./helpers/Log";
import {ArchivService} from "./VDR/ArchivService";
import {BackupService} from "./VDR/BackupService";
import {ShellyService} from "./ShellyService";
import {Storage} from "../DatabaseProvider";
import {BridgeIdentifier} from "./BridgeService";
import {App} from "../app";
import fs from "fs";
import {WebSocketBroadcast} from "./socket.io/WebSocketBroadcast";

export class JobSchedule {

    private static _instance: JobSchedule;

    run() {
        Log.info('JobSchedule started');
        this.backupTracks();
        this.vdr();
        this.saveNmeaSentences();
        this.cleanUpTrackArchive();
        this.signalKBroadcast();
        if (!App.vdrOnly) {
            this.electricityConsumption();
            this.checkPowerState();
            this.listenOnDevicePortChanges();
            this.monitorMotor();
            this.refreshShellyStates();
        }
    }

    private vdr() {
        if (process.env.APP_ENV !== 'local') {
            TrackService.Instance.setPrevPosition();
            setInterval(async () => {
                try {
                    await TrackService.Instance.logData();
                } catch (e) {
                    Log.error('[VDR] Error while logging data');
                    Log.error(e);
                }
            }, 4000);
        }
    }

    private signalKBroadcast() {
        setInterval(async () => {
            try {
                WebSocketBroadcast.schedule();
            } catch (e) {
                Log.error('Error while broadcasting SignalK data');
                Log.error(e);
            }
        }, 4000);
    }

    private cleanUpTrackArchive() {
        cron.schedule('*/10 * * * *', async () => {
            try {
                await ArchivService.getInstance().cleanUp();
            } catch (e) {
                Log.error('[VDR] Error while cleaning up track archive');
                Log.error(e);
            }
        });
    }

    private refreshShellyStates() {
        cron.schedule('*/10 * * * *', async () => {
            try {
                const bridgeType = await Storage.getInstance().BridgeType.findOne({
                    relations: {
                        bridges: {
                            devices: true,
                            type: true
                        }
                    },
                    where: {
                        identifier: BridgeIdentifier.bridge220v1cShelly
                    }
                });

                for (const bridge of bridgeType.bridges) {
                    const state = await ShellyService.getState(bridge);
                    for (const device of bridge.devices) {
                        device.isActive = state;
                        await device.save();
                    }
                }
            } catch (e) {
                Log.error('Error while refreshing shelly states');
                Log.error(e);
            }
        });
    }

    private backupTracks() {
        BackupService.Instance.handle().then();
        cron.schedule('*/5 * * * *', async () => {
            try {
                await BackupService.Instance.handle();
            } catch (e) {
                Log.error('[VDR] Error while backing up tracks');
                Log.error(e);
            }
        });
    }

    private saveNmeaSentences() {
        cron.schedule('*/1 * * * *', async () => {
            try {
                fs.writeFileSync(App.nmeaSentencesFile, SignalKHelper.getInstance().gpsSentences.join('\n'));
            } catch (e) {
                Log.error('[NMEA 1083] Could not save NMEA sentences');
                Log.error(e);
            }
        });
    }

    private electricityConsumption() {
        cron.schedule('0 0 * * *', () => {
            ElectricityConsumptionService.Instance.save().then();
        });
    }

    private checkPowerState() {
        setInterval(async () => {
            await CustomEvent.getInstance().CheckPowerConnection();
        }, 4000);
    }

    private listenOnDevicePortChanges() {
        setInterval(async () => {
            await DeviceService.checkPortChanges();
        }, 2000);
    }

    private monitorMotor() {
        setInterval(async () => {
            const rpmVal = await SignalKHelper.getInstance().getByPath<number>('electrical.alternators.0.revolutions');
            await EngineHourMeterService.getInstance().receiveData(rpmVal);
        }, 2000);
        cron.schedule('* * * * *', () => {
            EngineHourMeterService.getInstance().getSeconds().then();
        });
    }

    static get Instance() {
        if (this._instance == null) this._instance = new JobSchedule();
        return this._instance;
    }

}
