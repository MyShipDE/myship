import {Storage} from "../DatabaseProvider";
import {EngineHourMeterRecord} from "../modals/EngineHourMeterRecord";
import {SocketIO} from "./socket.io/SocketIO";
import {SocketChannel} from "../resources/SocketChannel";
import {Log} from "./helpers/Log";

export class EngineHourMeterService {

    private static _instance: EngineHourMeterService;
    private _inProgress = false;

    async receiveData(motorSpeed: number) {
        try {
            if (!this._inProgress) {
                this._inProgress = true;
                const lastRrecord = await this.getLastRecord();
                if (motorSpeed <= 0) {
                    await this.markAsInactive(lastRrecord);
                } else if (motorSpeed > 0) {
                    await this.markAsActive(lastRrecord);
                }
                this._inProgress = false;
            }
        } catch (e) {
            Log.error('[EngineHourMeterService] Error while receiving data');
        }
    }

    async getLastRecord(): Promise<EngineHourMeterRecord> {
        const records = await Storage.getInstance().EngineHourMeterRecord.find({
            order: {
                id: 'DESC'
            },
        });
        if (records == null) {
            return null;
        }
        return records[0];
    }

    async markAsActive(lastRecord: EngineHourMeterRecord): Promise<void> {
        if (lastRecord.stopAt != null) {
            const record = new EngineHourMeterRecord();
            record.startAt = new Date();
            await record.save();
        }
    }

    async markAsInactive(record: EngineHourMeterRecord): Promise<void> {
        if (record != null && record.stopAt == null) {
            record.stopAt = new Date();
            await record.save();
        }
    }

    async getSeconds() {
        const records = await Storage.getInstance().EngineHourMeterRecord.find();
        let seconds = 0;
        records.forEach(record => {

            if (record.stopAt == null) {
                record.stopAt = new Date();
            }

            const startTime = new Date(record.startAt); // Start time in milliseconds since 1970-01-01
            const stopTime = new Date(record.stopAt); // Stop time in milliseconds since 1970-01-01

            const diff = Math.abs(stopTime.getTime() - startTime.getTime());
            const durationInSeconds = Math.round(diff / 1000); // Duration in seconds (rounded down)

            seconds += durationInSeconds;
        });
        SocketIO.emit(SocketChannel.EngineLogUpdateObject, seconds);
        return seconds;
    }

    async getSecondsByDay() {
        const records = await Storage.getInstance().EngineHourMeterRecord.find();

        const currentDate = new Date();
        const currentDay = currentDate.getDate();

        const filteredDates = records.filter(tracks => new Date(tracks.startAt).getDate() === currentDay);

        let seconds = 0;
        filteredDates.forEach(record => {

            if (record.stopAt == null) {
                record.stopAt = new Date();
            }

            const startTime = new Date(record.startAt); // Start time in milliseconds since 1970-01-01
            const stopTime = new Date(record.stopAt); // Stop time in milliseconds since 1970-01-01

            const diff = Math.abs(stopTime.getTime() - startTime.getTime());
            const durationInSeconds = Math.round(diff / 1000); // Duration in seconds (rounded down)

            seconds += durationInSeconds;
        });
        SocketIO.emit(SocketChannel.EngineLogUpdateObjectByDay, seconds);
        return seconds;
    }

    static getInstance() {
        if (this._instance == null) this._instance = new EngineHourMeterService();
        return this._instance;
    }

}
