import {TrackService} from "./TrackService";
import {Track} from "../../modals/Track";
import {Storage} from "../../DatabaseProvider";
import {Log} from "../helpers/Log";

export class ArchivService {

    private static _instance: ArchivService;

    async completeTrackObject(track: Track): Promise<Track> {
        try {
            track.records = await Storage.getInstance().TrackRecord.find({
                relations: {
                    manualEntries: true,
                    voiceEntry: true
                },
                where: {
                    track: {
                        id: track.id
                    }
                }
            });

            for (const record of track.records) {
                record.data = await Storage.getInstance().TrackData.find({
                    relations: {
                        identifier: true,
                        unit: true
                    },
                    where: {
                        record: {
                            id: record.id
                        }
                    }
                });
            }

            // Debugs
            let dataCount = 0;
            for (const record of track.records) {
                dataCount += record.data.length;
            }
            Log.debug(`GET COMPLETE-TRACK: #${track.id} (${track.name}) - Records: ${track.records.length} - Data: ${dataCount}`);

            return track;
        } catch (e) {
            Log.error(e);
            return null;
        }
    }

    async cleanUp(): Promise<void> {
        const tracks = await TrackService.Instance.getTracks();
        for (const trackMetaData of tracks) {

            const track = await TrackService.Instance.getTrack(trackMetaData.id);

            let deleteTrack = false;

            if (track.name === '2D') {
                await this.deleteTrack(track);
                continue;
            }

            if (track.stopAt == null) {
                continue;
            } else if (track.records.length < 3) {
                deleteTrack = true;
            }

            const maxSpeed = -1;
            let voiceEntry = false;
            let manualEntries = 0;

            for (const records of track.records) {

                /* const data = await TrackService.Instance.getTrackDataByRecord(records.id);
                if (data.find(x => x.identifier.identifier === SignalKIdentifier.navigationSpeedOverGround) != null) {
                    const speedData = data.find(x => x.identifier.identifier === SignalKIdentifier.navigationSpeedOverGround);
                    if (speedData == null) {
                        continue;
                    }
                    const speed = UnitHelper.convert(speedData?.value, 'm/s').value;
                    if (speed > maxSpeed) {
                        maxSpeed = speed;
                    }
                } */

                if (records.voiceEntry != null) {
                    voiceEntry = true;
                }

                if (records.manualEntries != null && records.manualEntries.length > 0) {
                    manualEntries++;
                }

            }

            if (maxSpeed === -1) {
                continue;
            }

            if ((deleteTrack || maxSpeed < 1) && !voiceEntry && manualEntries === 0) {
                await this.deleteTrack(track);
            }

        }
    }

    private async deleteTrack(track: Track) {
        for (const record of track.records) {
            for (const manualEntry of record.manualEntries) {
                await manualEntry.remove();
            }
            const trackData = await TrackService.Instance.getTrackDataByRecord(record.id);
            for (const data of trackData) {
                await data.remove();
            }
            await record.remove();
        }
        await track.remove();
    }

    public static getInstance(): ArchivService {
        if (this._instance == null) {
            this._instance = new ArchivService();
        }
        return this._instance;
    }

}