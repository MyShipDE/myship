import {Storage} from "../DatabaseProvider";
import {SignalKDatasource} from "../modals/SignalKDatasource";
import {DateHelper} from "./helpers/DateHelper";
import {SignalKHelper} from "./helpers/SignalKHelper";
import {Mail} from "./Notifications/Mail";
import {UnitHelper} from "./helpers/UnitHelper";
import {AlarmProtocol} from "../modals/AlarmProtocol";
import {SMS} from "./Notifications/SMS";
import {SocketIO} from "./socket.io/SocketIO";
import {SocketChannel} from "../resources/SocketChannel";
import {DisplayedAlarm} from "../classes/DisplayedAlarm";

export class AlarmService {

    private static _Instance: AlarmService;

    private intervalLock = false;

    private constructor() {
        //
    }

    static get Instance() {
        if (this._Instance == null) {
            this._Instance = new this();
        }
        return this._Instance;
    }

    async Boot(): Promise<void> {
        await this.EnsureExists('Batterie - Aufladungen', 'electrical.batteries.main.capacity.consumedCharge');
        await this.EnsureExists('Batterie - Kapazität', 'electrical.batteries.main.capacity.stateOfCharge', 'ratio');
        await this.EnsureExists('Batterie - verbleibene Zeit', 'electrical.batteries.main.capacity.timeRemaining', 's');
        await this.EnsureExists('Batterie - Verbrauch in A', 'electrical.batteries.main.current', 'A');
        await this.EnsureExists('Batterie - Lebensdauer', 'electrical.batteries.main.lifetimeDischarge', 'C');
        await this.EnsureExists('Batterie - Spannung', 'electrical.batteries.main.voltage', 'V');
        await this.EnsureExists('Temperatur - Motorraum', 'environment.inside.engineRoom.temperature', 'K');
        await this.EnsureExists('Temperatur - Kühlwasser', 'environment.inside.heating.temperature', 'K');
        await this.EnsureExists('Temperatur - Innen', 'environment.inside.temperature', 'K');
        await this.EnsureExists('Temperatur - Außen', 'environment.outside.temperature', 'K');
        await this.EnsureExists('Navigation - courseGreatCircle.bearingTrackTrue?', 'navigation.courseGreatCircle.bearingTrackTrue', 'rad');
        await this.EnsureExists('Navigation - courseGreatCircle.crossTrackError?', 'navigation.courseGreatCircle.crossTrackError', 'm');
        await this.EnsureExists('Navigation - courseGreatCircle.nextPoint.arrivalCircle?', 'navigation.courseGreatCircle.nextPoint.arrivalCircle');
        await this.EnsureExists('Navigation - courseGreatCircle.nextPoint.bearingTrue?', 'navigation.courseGreatCircle.nextPoint.bearingTrue');
        await this.EnsureExists('Navigation - courseGreatCircle.nextPoint.distance?', 'navigation.courseGreatCircle.nextPoint.distance');
        await this.EnsureExists('Navigation - COG Magnetic', 'navigation.courseOverGroundMagnetic', 'rad');
        await this.EnsureExists('Navigation - COG True ', 'navigation.courseOverGroundTrue', 'rad');
        await this.EnsureExists('Navigation - Satellitten', 'navigation.gnss.satellites');
        await this.EnsureExists('Navigation - SOG', 'navigation.speedOverGround', 'm/s');

        this.startInterval();
    }

    async EnsureExists(name: string, path: string, unit: string = null) {
        let item: SignalKDatasource = await Storage.getInstance().SignalKDatasource.findOneBy({path});
        if (item == null) {
            item = new SignalKDatasource();
            item.name = name;
            item.path = path;
            item.unit = unit;
            await item.save();
        } else if (item.name !== name || item.unit !== unit) {
            item.name = name;
            item.unit = unit;
            await item.save();
        }
    }

    startInterval() {
        setInterval(async () => {
            if (!this.intervalLock) {
                this.intervalLock = true;
                const alarms = await Storage.getInstance().Alarm.find({
                    relations: {
                        signalKDatasource: true
                    },
                    where: {
                        active: true
                    }
                });

                for (const alarm of alarms) {
                    if (alarm.lastCheck == null) {
                        alarm.lastCheck = new Date();
                        await alarm.save();
                    }
                    if (DateHelper.addSeconds(alarm.interval, alarm.lastCheck) < new Date()) {
                        const currentValue = await SignalKHelper.getInstance().getByPath(alarm.signalKDatasource.path);
                        if (currentValue != null && typeof currentValue === 'number' && alarm.minValue != null && alarm.maxValue != null) {
                            if ((currentValue <= alarm.minValue || currentValue >= alarm.maxValue) && !alarm.reached) {
                                const converted = UnitHelper.convert(currentValue, alarm.signalKDatasource.unit, 1);
                                const customMessage = alarm.customMailMessage != null ? alarm.customMailMessage : 'Benachrichtigung - Ein Alarm wurde ausgelöst!';
                                alarm.reached = true;
                                alarm.lastCheck = new Date();

                                if (alarm.email != null) {
                                    const text = `
                                        <b>${customMessage}</b><br>
                                        <br>
                                        ${alarm.signalKDatasource.name}: <b>${converted.value} ${converted.unit}</b><br>
                                        Zeitstempel: <b>${DateHelper.format(alarm.lastCheck)}</b><br>
                                    `;

                                    await new Mail().send(alarm.email, '[Alarm] ' + alarm.name, text);
                                }

                                if (alarm.phone != null && customMessage != null) {
                                    const text = `${customMessage}\n${alarm.signalKDatasource.name}: ${converted.value} ${converted.unit}\nZeitstempel: ${DateHelper.format(alarm.lastCheck)}`;

                                    await SMS.Instance.send(text, alarm.phone);
                                }

                                if (alarm.showInApp) {
                                    const displayedAlarm = new DisplayedAlarm();
                                    displayedAlarm.title = "Ein Alarm wurde ausgelöst!";
                                    displayedAlarm.message = alarm.name;
                                    displayedAlarm.value = currentValue;
                                    displayedAlarm.unit = alarm.signalKDatasource.unit;
                                    SocketIO.emit(SocketChannel.AlarmTriggeredObject, displayedAlarm);
                                }

                                if (alarm.logging) {
                                    const log = new AlarmProtocol()
                                    log.alarm = alarm;
                                    await log.save();
                                }

                                await alarm.save();

                            } else if ((currentValue > alarm.minValue && currentValue < alarm.maxValue) && alarm.reached) {
                                alarm.reached = false;
                                alarm.lastCheck = new Date();
                                await alarm.save();
                            }
                        }
                    }
                }
                this.intervalLock = false;
            }
        }, 1000);
    }

}
