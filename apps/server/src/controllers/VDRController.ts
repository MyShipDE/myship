import express from "express";
import {LogbookManualInput} from "../modals/LogbookManualInput";
import {LogbookManualInputType} from "../modals/LogbookManualInputType";
import {Log} from "../services/helpers/Log";
import {SocketIO} from "../services/socket.io/SocketIO";
import {Storage} from "../DatabaseProvider";
import {ManualEntry} from "../modals/ManualEntry";
import {TrackService} from "../services/VDR/TrackService";
import {SocketChannel} from "../resources/SocketChannel";
import {SignalKHelper} from "../services/helpers/SignalKHelper";

export class VDRController {

    async GetManualInputs(req: express.Request, res: express.Response) {
        const types = await Storage.getInstance().LogbookManualInput.find();

        res.status(200).send(types);
    }

    async GetManualInputTypes(req: express.Request, res: express.Response) {

        const types = await Storage.getInstance().LogbookManualInputType.find();

        res.status(200).send(types);
    }

    async PostManualInput(req: express.Request, res: express.Response) {
        if (req.body.type_id == null || req.body.name == null) {
            return res.status(400).end();
        }

        const type = await LogbookManualInputType.find(req.body.type_id);
        if (type == null) {
            return res.status(400).end();
        }

        const category = new LogbookManualInput();
        category.typeId = req.body.type_id;
        category.name = req.body.name;
        await category.save();

        SocketIO.emit(SocketChannel.LogbookManualInputManagedNotification, null);
        res.status(200).end();
    }

    async DeleteManualInput(req: express.Request, res: express.Response) {
        if (req.params.id == null) {
            return res.status(400).end();
        }

        const type = await Storage.getInstance().LogbookManualInput.findOneBy({id: +req.params.id});
        if (type == null) {
            return res.status(400).end();
        }

        await type.remove();

        SocketIO.emit(SocketChannel.LogbookManualInputManagedNotification, null);
        res.status(200).end();
    }

    async PostRecordReminder(req: express.Request, res: express.Response) {
        Log.info('[VDR] - Broadcast VDR-Reminder by SocketIO - (Test)');
        SocketIO.emit(SocketChannel.LogbookEntryReminderNotification, null);
        res.status(200).end();
    }

    async PostManualRecord(req: express.Request, res: express.Response) {
        if (req.body == null || req.body.values == null || req.body.values.length == null || req.body.values.length < 1) {
            return res.status(400).end();
        }

        const activeTrack = await TrackService.Instance.getActiveTrack();
        if (activeTrack == null) {
            return res.status(405).end();
        }

        try {
            const manualEntries: ManualEntry[] = [];
            for (const value of req.body.values) {
                const manualEntry: ManualEntry = Object.assign(new ManualEntry(), value);
                await manualEntry.save();
                manualEntries.push(manualEntry);
            }

            const trackRecord = await TrackService.Instance.logDataAndSaveManualEntry(manualEntries);

            if (trackRecord == null) {
                return res.status(400).end();
            }

            SocketIO.emit(SocketChannel.TrackDetailManagedObject, trackRecord);
            res.status(200).end();
            
        } catch (e) {
            res.status(500).end();
        }

    }

    async GetPosition(req: express.Request, res: express.Response) {
        try {
            const position = await TrackService.Instance.getLastPosition();
            res.status(200).send(position);
        } catch (e) {
            Log.error(e);
            res.status(500).end();
        }
    }

}
