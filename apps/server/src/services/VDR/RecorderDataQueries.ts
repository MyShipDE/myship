import {Storage} from "../../DatabaseProvider";
import {In, IsNull, Not} from "typeorm";
import {TrackData} from "../../modals/TrackData";
import {TrackDataKey} from "../../modals/TrackDataKey";
import {TrackDataUnit} from "../../modals/TrackDataUnit";
import {TrackRecord} from "../../modals/TrackRecord";
import {SignalKIdentifier} from "../../classes/SignalKIdentifier";
import {Coordinate} from "../../classes/Coordinate";
import {SignalKBasicData} from "../../classes/SignalKBasicData";
import {SignalKHelper} from "../helpers/SignalKHelper";
import {VoiceEntry} from "../../modals/VoiceEntry";
import {ManualEntry} from "../../modals/ManualEntry";
import {log} from "winston";
import {Log} from "../helpers/Log";
import {TrackQueries} from "../../queries/TrackQueries";

export class RecorderDataQueries {

    async getTrack(id: number) {
        return await Storage.getInstance().Track.findOne({
            relations: {
                records: {
                    voiceEntry: true,
                    manualEntries: true
                }
            },
            where: {
                id
            }
        });
    }

    async getBasicTrackData(record: TrackRecord) {
        return await Storage.getInstance().TrackData.find({
            where: {
                record: {
                    id: record.id
                },
                identifier: {
                    identifier: In(SignalKBasicData)
                }
            }
        });
    }

    async getTrackDataByKey(recordId: number, key: string) {
        return await Storage.getInstance().TrackData.findOne({
            where: {
                record: {
                    id: recordId
                },
                identifier: {
                    identifier: key
                }
            }
        });
    }

    async getTrackDataByRecord(recordId: number) {
        return await Storage.getInstance().TrackData.find({
            where: {
                record: {
                    id: recordId
                }
            }
        });
    }

    async getTracks() {
        return await Storage.getInstance().Track.find();
    }

    async getActiveTrack() {
        return await Storage.getInstance().Track.findOne({
            relations: {
                records: true
            },
            where: {
                stopAt: IsNull()
            }
        });
    }

    async getLastTrack() {
        const track = await Storage.getInstance().Track.find({
            order: {id: 'DESC'},
            take: 1
        });
        if (track == null || track.length == null || track.length < 1) {
            return null;
        } else {
            return track[0];
        }
    }

    async getLastPosition() {
        const lon = await Storage.getInstance().TrackData.find({
            relations: {
                identifier: true,
            },
            where: {
                identifier: {
                    identifier: SignalKIdentifier.navigationPositionValueLongitude
                }
            },
            order: {id: 'DESC'},
            take: 1
        });
        const lat = await Storage.getInstance().TrackData.find({
            relations: {
                identifier: true,
            },
            where: {
                identifier: {
                    identifier: SignalKIdentifier.navigationPositionValueLatitude
                }
            },
            order: {id: 'DESC'},
            take: 1
        });
        if (lon != null && lon.length != null && lon.length > 0 && lat != null && lat.length != null && lat.length > 0) {
            const coordinate = new Coordinate();
            coordinate.longitude = lon[0].value;
            coordinate.latitude = lat[0].value;
            return coordinate;
        } else {
            return null;
        }
    }

    async getLatestLogEntry() {
        const track = await Storage.getInstance().TrackRecord.find({
            relations: {
                data: {
                    identifier: true,
                    unit: true
                }
            },
            order: {id: 'DESC'},
            take: 1
        });
        if (track == null || track.length == null || track.length < 1) {
            return null;
        } else {
            return track[0];
        }
    }

    async getRecord(id: number) {
        return await Storage.getInstance().TrackRecord.findOne({
            relations: {
                data: true
            },
            where: {
                id
            }
        });
    }

    async getRecordOnly(id: number) {
        return await Storage.getInstance().TrackRecord.findOne({
            where: {
                id
            }
        });
    }

    async createTrackRecord(trackId: number,
                            rawData = SignalKHelper.getInstance().cachedData,
                            voiceEntry: VoiceEntry = null,
                            manualEntries: ManualEntry[] = []): Promise<TrackRecord> {

        if (rawData == null || rawData.length == null || rawData.length < 1) {
            return null;
        }

        const recordId = await TrackQueries.addTrackRecord(trackId, voiceEntry != null ? voiceEntry.id : null);
        const data = rawData.filter(x => !x.path.includes('satellites'));

        Log.debug(`Saving ${data.length} SignalK-Datasets`);

        for (const item of data) {
            const trackDataKey = await Storage.getInstance().TrackDataKey
                .findOne({where: {identifier: item.path}});

            const trackDataKeyId = trackDataKey == null
                ? await TrackQueries.addTrackDataKey(item.path, item.path, false)
                : trackDataKey.id;

            const trackDataUnit = await Storage.getInstance().TrackDataUnit
                .findOne({where: {unit: item.path}});

            const trackDataUnitId = trackDataUnit == null
                ? await TrackQueries.addTrackDataUnit(item.path)
                : trackDataUnit.id;

            await TrackQueries.addTrackData(recordId, trackDataKeyId, trackDataUnitId, item.value);
        }

        for (const manualEntry of manualEntries) {
            await TrackQueries.addManualEntry(manualEntry.name, manualEntry.value, recordId);
        }

        return await this.getRecordOnly(recordId);
    }

}