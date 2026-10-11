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

    // Camera RTSP streams are configured server-side via the CAMERA_STREAMS
    // env var (comma-separated URLs) — never on the client.
    getCameras(req: express.Request, res: express.Response) {
        const raw = process.env.CAMERA_STREAMS || '';
        const streams = raw
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
        res.status(200).send(streams);
    };

    // Map provider config (MapTiler key + style) is kept server-side in .env.
    getMapConfig(req: express.Request, res: express.Response) {
        res.status(200).send({
            key: process.env.MAPTILER_KEY || '',
            style: process.env.MAPTILER_STYLE || 'streets-v2',
        });
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
