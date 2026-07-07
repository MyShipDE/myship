import {Storage} from "../DatabaseProvider";
import {Track} from "../modals/Track";
import {TrackData} from "../modals/TrackData";
import {TrackDataKey} from "../modals/TrackDataKey";
import {TrackDataUnit} from "../modals/TrackDataUnit";
import {TrackRecord} from "../modals/TrackRecord";
import {VoiceEntry} from "../modals/VoiceEntry";
import {ManualEntry} from "../modals/ManualEntry";

export class TrackQueries {

    // Track
    static async addTrack(
        name: string,
        stopAt: Date,
        isHidden: boolean,
        isSaved: boolean,
        identifier: string,
        lastReminder: Date
    ) {
        const result = await Storage.getInstance().Track
            .createQueryBuilder()
            .insert()
            .into(Track)
            .values({
                name,
                stopAt,
                isHidden,
                isSaved,
                identifier,
                lastReminder,
            })
            .execute();
        return result.identifiers[0].id as number;
    }

    // TrackData
    static async addTrackData(
        recordId: number,
        identifierId: number,
        unitId: number,
        value: number
    ) {
        const result = await Storage.getInstance().TrackData
            .createQueryBuilder()
            .insert()
            .into(TrackData)
            .values({
                record: { id: recordId },
                identifier: { id: identifierId },
                unit: { id: unitId },
                value
            })
            .execute();
        return result.identifiers[0].id as number;
    }

    // TrackDataKey
    static async addTrackDataKey(
        identifier: string,
        description: string,
        isSynced: boolean
    ) {
        const result = await Storage.getInstance().TrackDataKey
            .createQueryBuilder()
            .insert()
            .into(TrackDataKey)
            .values({
                identifier,
                description,
                isSynced
            })
            .execute();
        return result.identifiers[0].id as number;
    }

    // TrackDataUnit
    static async addTrackDataUnit(
        unit: string
    ) {
        const result = await Storage.getInstance().TrackDataUnit
            .createQueryBuilder()
            .insert()
            .into(TrackDataUnit)
            .values({
                unit
            })
            .execute();
        return result.identifiers[0].id as number;
    }

    // TrackRecord
    static async addTrackRecord(
        trackId: number,
        voiceEntryId: number
    ) {
        const result = await Storage.getInstance().TrackRecord
            .createQueryBuilder()
            .insert()
            .into(TrackRecord)
            .values({
                track: { id: trackId },
                voiceEntry: { id: voiceEntryId },
            })
            .execute();
        return result.identifiers[0].id as number;
    }

    // VoiceEntry
    static async addVoiceEntry(
        message: string,
        isSaved: boolean
    ) {
        const result = await Storage.getInstance().VoiceEntry
            .createQueryBuilder()
            .insert()
            .into(VoiceEntry)
            .values({
                message,
                isSaved
            })
            .execute();
        return result.identifiers[0].id as number;
    }

    // ManualEntry
    static async addManualEntry(
        name: string,
        value: string,
        recordId: number
    ) {
        const result = await Storage.getInstance().ManualEntry
            .createQueryBuilder()
            .insert()
            .into(ManualEntry)
            .values({
                name,
                value,
                record: { id: recordId }
            })
            .execute();
        return result.identifiers[0].id as number;
    }
}
