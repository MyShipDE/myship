import {VoiceEntry} from "../../modals/VoiceEntry";
import fs from "fs";
import {WhisperAI} from "../WhisperAI";
import {TrackService} from "./TrackService";
import {Storage} from "../../DatabaseProvider";

export class AudioService {

    static async handleFile(file: any, transcribe: boolean = true): Promise<boolean> {
        const voiceEntry = await (new VoiceEntry().save());
        if (voiceEntry.id == null) {
            return false;
        }

        const extArr = file.originalname.split(".");
        const ext = extArr[extArr.length - 1];
        const newPath = __dirname + '/../../../storage/audio/' + voiceEntry.id + '.' + ext;
        await fs.renameSync(file.path, newPath);

        if (transcribe) {
            WhisperAI.translate(voiceEntry.id + '.' + ext);
        }
        return true;
    }

    static async saveMessage(id: number, message: string): Promise<void> {
        const voiceEntry = await Storage.getInstance().VoiceEntry.findOneBy({id});
        voiceEntry.message = message;
        await voiceEntry.save();
        await TrackService.Instance.logDataAndSaveVoiceRecord(voiceEntry);
    }

}
