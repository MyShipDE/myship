import {SocketIO} from "../socket.io/SocketIO";
import {VoiceEntry} from "../../modals/VoiceEntry";
import {BaseRecorderService} from "./BaseRecorderService";
import {SignalKHelper} from "../helpers/SignalKHelper";
import {Log} from "../helpers/Log";
import {SocketChannel} from "../../resources/SocketChannel";
import {TrackRecord} from "../../modals/TrackRecord";
import {SettingsService} from "../SettingsService";
import {DataRegistryName} from "../../resources/RegistryProperties";
import {ManualEntry} from "../../modals/ManualEntry";

export class TrackService extends BaseRecorderService {

    private static _Instance: TrackService;

    private logInProgress = false;

    private constructor() {
        super();
    }

    static get Instance() {
        if (this._Instance == null) {
            this._Instance = new TrackService();
        }
        return this._Instance;
    }

    async logData() {
        try {
            if (this.logInProgress) {
                return;
            }
            this.logInProgress = true;

            Log.debug('[VDR] Logging');

            await this.ensureCurrentPositionStored();
            Log.debug('[VDR] Current position stored');

            const lastCheck = SettingsService.Instance.findProperty(DataRegistryName.LastVoyageDataRecorderCheck);
            Log.debug('[VDR] Last check: ' + lastCheck.value.toString());

            if (SignalKHelper.getInstance().cachedData.length === 0) {
                Log.error('[VDR] Cached-Values are empty, is SignalK running?');
                return;
            }

            /* if (await this.isCourseChangedIgnoreInterval()) {
                Log.debug('[VDR] Course changed!');
            } else if (!(await this.CheckIfIntervalReached(new Date(lastCheck.value.toString())))) {
                Log.debug('[VDR] Interval not reached!');
                return;
            } */

            lastCheck.value = new Date().toISOString();
            await SettingsService.Instance.push();

            if (await this.shouldCreateRecord()) {
                Log.debug('[VDR] New Record should created.');
                const track = await this.getCurrentTrack();
                const record = await this.createTrackRecord(track.id);
                this.prevRecordCreatedAt = record.createdAt;
                this.setPrevPosition();
                await this.IsRecordReminderRequired();
                SocketIO.emit(SocketChannel.TrackDetailManagedObject, record.id);
            } else if (await this.shouldStopRecord()) {
                Log.debug('[VDR] Stopping track');
            } else {
                Log.debug('[VDR] Nothing to do');
            }
        } finally {
            this.logInProgress = false;
        }
    }

    async logDataAndSaveVoiceRecord(voiceEntry: VoiceEntry) {
        const activeTrack = await this.getActiveTrack();

        if (activeTrack != null) {
            const record = await this.createTrackRecord(activeTrack.id, SignalKHelper.getInstance().cachedData, voiceEntry);
            SocketIO.emit(SocketChannel.TrackDetailManagedObject, record);
        }

    }

    async logDataAndSaveManualEntry(manualEntries: ManualEntry[]): Promise<TrackRecord> {
        const activeTrack = await this.getActiveTrack();
        if (activeTrack != null) {
            const record = await this.createTrackRecord(activeTrack.id, SignalKHelper.getInstance().cachedData, null, manualEntries);
            SocketIO.emit(SocketChannel.TrackDetailManagedObject, record);
            return record;
        }
        return null;
    }

}
