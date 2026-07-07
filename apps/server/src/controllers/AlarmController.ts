import express from "express";
import {AudioService} from "../services/VDR/AudioService";
import {WhisperAI} from "../services/WhisperAI";
import {AudioRecorderService} from "../services/AudioRecorderService";
import {Storage} from "../DatabaseProvider";
import {Alarm} from "../modals/Alarm";
import {Log} from "../services/helpers/Log";
import {SignalKDatasource} from "../modals/SignalKDatasource";
import {SocketIO} from "../services/socket.io/SocketIO";
import {SocketChannel} from "../resources/SocketChannel";

export class AlarmController {

    async Get(req: express.Request, res: express.Response) {
        try {
            const alarms = await Storage.getInstance().Alarm.find({
                relations: {
                    signalKDatasource: true
                }
            });

            return res.status(200).send(alarms);
        } catch (e) {
            return res.status(500).end();
        }
    }

    async GetSensors(req: express.Request, res: express.Response) {
        try {
            const data = await Storage.getInstance().SignalKDatasource.find();

            return res.status(200).send(data);
        } catch (e) {
            return res.status(500).end();
        }
    }

    async Put(req: express.Request, res: express.Response) {
        try {
            const alarm: Alarm = Object.assign(new Alarm(), req.body);
            alarm.signalKDatasource = Object.assign(new SignalKDatasource(), alarm.signalKDatasource);

            if (alarm.name == null
                || alarm.maxValue == null || alarm.minValue == null
                || alarm.interval == null) {
                return res.status(400).end();
            }

            await alarm.save();

            SocketIO.emit(SocketChannel.AlarmManagedNotification, null);
            return res.status(200).end();
        } catch (e) {
            Log.error(e);
            return res.status(500).end();
        }
    }

    async Delete(req: express.Request, res: express.Response) {
        try {
            const alarm = await Storage.getInstance().Alarm.findOneBy({id: +req.params.id});

            if (alarm == null) {
                return res.status(400).end();
            }

            await Storage.getInstance().Alarm.remove(alarm);

            SocketIO.emit(SocketChannel.AlarmManagedNotification, null);
            return res.status(200).end();
        } catch (e) {
            return res.status(500).end();
        }
    }

}
