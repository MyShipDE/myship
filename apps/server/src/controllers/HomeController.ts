import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import {App} from "../app";
import os from 'os';
import {SocketIO} from "../services/socket.io/SocketIO";
import {SocketChannel} from "../resources/SocketChannel";
import {DisplayedAlarm} from "../classes/DisplayedAlarm";

dotenv.config();

export class HomeController {

    prepare(req: express.Request, res: express.Response) {
        res.status(200).end("REST API Works!");
    };

    send(req: express.Request, res: express.Response) {
        res.sendFile(path.resolve("dist/public/index.html"));
    };

    test(req: express.Request, res: express.Response) {
        res.status(200).end();
    };

    getLicence(req: express.Request, res: express.Response) {
        if (process.env.LICENCE_KEY != null) {
            res.status(200).send({
                licence: process.env.LICENCE_KEY
            });
            return;
        }
        res.status(500).end();
    }

    getInfo(req: express.Request, res: express.Response): void {
        res.status(200).send({
            name: 'REST API of MyShip-Server',
            version: App.PROP_VERSION,
            platform: process.platform,
            os: os.version(),
            arch: os.arch(),
            hostname: os.hostname(),
            cpus: os.cpus(),
            memory: os.totalmem(),
            uptime: os.uptime()
        });
    }

    testAlarm(req: express.Request, res: express.Response) {
        const alarm = new DisplayedAlarm();
        alarm.title = "Test Alarm";
        alarm.message = "This is a test alarm";
        alarm.value = -1;
        alarm.unit = "%";
        SocketIO.emit(SocketChannel.AlarmTriggeredObject, alarm);
        res.status(200).end();
    };

}
