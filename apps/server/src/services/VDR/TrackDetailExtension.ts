import {Storage} from "../../DatabaseProvider";
import {Log} from "../helpers/Log";
import {Coordinate} from "../../classes/Coordinate";
import {TemplateService} from "./TemplateService";
import {DateHelper} from "../helpers/DateHelper";
import {SocketIO} from "../socket.io/SocketIO";
import {SocketChannel} from "../../resources/SocketChannel";
import {RecorderDataQueries} from "./RecorderDataQueries";
import {TrackDataKey} from "../../modals/TrackDataKey";
import {SignalKHelper} from "../helpers/SignalKHelper";
import {CloudService} from "../CloudService";

export class TrackDetailExtension extends RecorderDataQueries {

    isPositionChanging(prev: Coordinate, current: Coordinate, allowedDistance: number): boolean {

        if (prev == null || current == null ||
            prev.latitude == null || prev.longitude == null ||
            current.latitude == null) return false;

        const EARTH_RADIUS = 6371000; // in Metern

        // Konvertieren von Grad zu Rad
        const dLat = (current.latitude - prev.latitude) * Math.PI / 180;
        const dLon = (current.longitude - prev.longitude) * Math.PI / 180;

        // Berechnung der Entfernung mit dem Haversine-Algorithmus
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(prev.latitude * Math.PI / 180) * Math.cos(current.latitude * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = EARTH_RADIUS * c;

        // Überprüfung der Entfernungsabweichung
        return distance > allowedDistance;
    }

    isCourseChanged(prevCourse: number, currentCourse: number, allowedCourseChange: number): boolean {

        // Überprüfung der Kursabweichung
        if (prevCourse !== null && currentCourse !== null) {
            let courseChange = Math.abs(currentCourse - prevCourse);
            courseChange = courseChange > 180 ? 360 - courseChange : courseChange; // Korrektur für Grenzüberschreitungen
            if (courseChange > allowedCourseChange) {
                return true;
            }
        }

        return false;
    }

    isWithinLast30Minutes(date: Date): boolean {
        const dateObj = new Date(date);
        const THIRTY_MINUTES_IN_MS = 30 * 60 * 1000;
        const currentTime = new Date().getTime();
        const timestamp = dateObj.getTime();
        return currentTime - timestamp <= THIRTY_MINUTES_IN_MS;
    }

    async CheckIfIntervalReached(latest: Date): Promise<boolean> {
        const template = await TemplateService.getInstance().GetActive();
        if (template == null) return false;
        return DateHelper.addSeconds(template.loggingInterval, new Date(latest)) < new Date();
    }

    async IsRecordReminderRequired() {
        const template = await TemplateService.getInstance().GetActive();
        if (template == null) return false;

        const lastRecords = await Storage.getInstance().TrackRecord.find({
            relations: {
                voiceEntry: true,
                track: true
            },
            order: {
                id: "DESC"
            },
            take: 1
        });

        if (lastRecords.length === 0) {
            return;
        }

        const lastRecord = lastRecords[0];

        if (lastRecord.voiceEntry != null) {
            return;
        }

        if (lastRecord.track.lastReminder == null) {
            lastRecord.track.lastReminder = new Date();
            await lastRecord.track.save();
            return;
        }

        if (DateHelper.addMinutes(template.reminderInterval, lastRecord.track.lastReminder) < new Date()
        ) {
            lastRecord.track.lastReminder = new Date();
            await lastRecord.track.save();
            Log.info('[VDR] - Broadcast VDR-Reminder');
            SocketIO.emit(SocketChannel.LogbookEntryReminderNotification, null);
        }
    }

    async ensureTrackDataKeysSynced() {
        try {
            const trackDataKeys = await Storage.getInstance().TrackDataKey.find({
                where: {
                    isSynced: false
                }
            });

            for (const key of trackDataKeys) {
                if (await CloudService.Instance.postTrackDataKey(key)) {
                    key.isSynced = true;
                    await key.save();
                }
            }
        } catch (e) {
            //
        }
    }

    async updateTrackDataKeys() {
        try {
            const trackDataKeys = await Storage.getInstance().TrackDataKey.find({
                where: {
                    isSynced: true
                }
            });

            const savedKeys: TrackDataKey[] = await CloudService.Instance.getTrackDataKey();
            for (const key of trackDataKeys) {
                const savedKey = savedKeys.find(k => k.identifier === key.identifier);
                if (savedKey != null && savedKey.description !== key.description) {
                    key.description = savedKey.description;
                    await key.save();
                }
            }
        } catch (e) {
            //
        }
    }

}
