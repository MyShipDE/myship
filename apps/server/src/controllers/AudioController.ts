import express from "express";
import {AudioService} from "../services/VDR/AudioService";
import {WhisperAI} from "../services/WhisperAI";
import {AudioRecorderService} from "../services/AudioRecorderService";
import {Storage} from "../DatabaseProvider";

export class AudioController {

    async PostStartRecord(req: express.Request, res: express.Response) {
        if (!AudioRecorderService._state) {
            AudioRecorderService.prepare();
            AudioRecorderService.start();
            return res.status(200).end();
        } else {
            return res.status(400).end();
        }
    }

    async PostStopRecord(req: express.Request, res: express.Response) {
        if (AudioRecorderService._state) {
            AudioRecorderService.stop();
            res.status(200).end();
        } else {
            res.status(400).end();
        }
    }

    async PostRequestTranscribe(req: express.Request, res: express.Response) {

        if (req.files == null) {
            return res.status(400).end("Request-Body contains no files.");
        }

        if (WhisperAI.inProcess) {
            return res.status(400).end("Busy");
        }

        // @ts-ignore
        const file: UploadedFile = req.files[0];

        const query = await AudioService.handleFile(file);
        if (!query) {
            res.status(500).end();
        }

        res.status(200).end();
    }

    async GetMessages(req: express.Request, res: express.Response) {
        const messages = await Storage.getInstance().VoiceEntry.find();
        res.status(200).send(messages);
    }

}
