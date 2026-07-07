import {Storage} from "../../DatabaseProvider";
import {ArchivService} from "./ArchivService";
import {CompressService} from "../CompressService";
import {DateHelper} from "../helpers/DateHelper";
import fs from "fs";
import {String} from "../helpers/String";
import dotenv from "dotenv";
import {CloudService} from "../CloudService";
import {Log} from "../helpers/Log";
import {App} from "../../app";
import path from "path";
import {IsNull, Not} from "typeorm";

dotenv.config();

export class BackupService {

    private static _instance: BackupService;
    private handleLock = false;

    async handle(): Promise<void> {

        if (this.handleLock) {
            return;
        }

        this.handleLock = true;

        const tracks = await Storage.getInstance().Track.find({
            where: [
                {
                    isSaved: false,
                    stopAt: Not(IsNull()),
                },
                {
                    isSaved: IsNull(),
                    stopAt: Not(IsNull()),
                }
            ]
        });

        Log.debug(`[VDR] BackupService: UnSave Tracks: ${tracks.length}.`);

        for (const track of tracks) {

            // let filePath: string;

            try {

                if (track.identifier == null) {
                    track.identifier = String.generate(32).toLowerCase();
                }

                const completeTrack = await ArchivService.getInstance().completeTrackObject(track);

                if (completeTrack.records.length < 1) {
                    Log.debug(`[VDR] BackupService: Track ${track.id} has no records.`);
                    continue;
                } else if (completeTrack.records.filter(r => r.data.length > 0).length < 1) {
                    Log.debug(`[VDR] BackupService: Track ${track.id} has no data.`);
                    continue;
                }

                // const trackAsString = JSON.stringify(completeTrack);
                // const fileName = `track_${String.generate(16)}.json`;
                // filePath = path.join(App.storageTempPath, fileName);
                // fs.writeFileSync(filePath, trackAsString);
                // filePath = await CompressService.getInstance().compress(trackAsString);

                if (await CloudService.Instance.postTrack(completeTrack)) {
                    track.isSaved = true;
                    await track.save();
                }

            } catch (e) {
                Log.error('Error while saving Track');
                Log.error(e);
            } /* finally {
                if (filePath !== undefined && fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } */
        }

        // Backup unlinked VoiceEntries
        try {
            const voiceEntries = await Storage.getInstance().VoiceEntry.find({
                relations: {
                    record: true
                },
                where: {
                    message: Not(IsNull()),
                    isSaved: false,
                    record: {
                        id: IsNull()
                    }
                }
            });

            for (const voiceEntry of voiceEntries) {
                const query = await CloudService.Instance.postUnlinkedVoiceEntry(voiceEntry);
                if (query) {
                    voiceEntry.isSaved = true;
                    await voiceEntry.save();
                }
            }

        } catch (e) {
            Log.error('Error while saving unlinked VoiceEntries');
            Log.error(e);
        }

        this.handleLock = false;

    }

    public static get Instance(): BackupService {
        if (this._instance == null) {
            this._instance = new BackupService();
        }
        return this._instance;
    }

}