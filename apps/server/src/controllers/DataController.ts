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
import {SignalKHelper} from "../services/helpers/SignalKHelper";
import {SignalKDataSet} from "../classes/SignalKDataSet";

export class DataController {

    async getData(req: express.Request, res: express.Response) {
        try {
            const type = req.query.type;

            let data: SignalKDataSet[] = SignalKHelper.getInstance().cachedData

            switch (type) {
                case 'electrical': {
                    data = data.filter((d) => d.path.includes('electrical'));
                    break;
                }
                default:
                    return res.status(400).end();
            }

            return res.status(200).send(data);
        } catch (e) {
            return res.status(500).end();
        }
    }

}
