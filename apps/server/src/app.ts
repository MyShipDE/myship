import * as dotenv from 'dotenv';
import express from "express";
import http from 'http';
import router from './routes';
import {SocketIO} from './services/socket.io/SocketIO';
import bodyParser from "body-parser";
import Bootstrap from './bootstrap';
import multer from 'multer';
import aedes from 'aedes';
import net from 'net';
import {createServer} from "aedes-server-factory";
import api from "./routes/api";
import {Message} from "./resources/Message";
import {Log} from "./services/helpers/Log";
import {ProxyService} from "./services/ProxyService";
import {MiddlewareRegistry} from "./Kernel";
import path from "path";
import fs from "fs";
import {ProxyMiddleware} from "./middlewares/ProxyMiddleware";
import {String} from "./services/helpers/String";

// tslint:disable-next-line:no-var-requires
const ws = require('websocket-stream');

dotenv.config();

export class App {

    public static PROP_VERSION = "1.1";
    public static storagePath: string = path.join(__dirname, '..', 'storage');
    public static storageTempPath: string = path.join(App.storagePath, 'temp');
    public static storageAudioPath: string = path.join(App.storagePath, 'audio');
    public static storageFilesPath: string = path.join(App.storagePath, 'files');
    public static storageUploadPath: string = path.join(App.storagePath, 'uploads');
    public static logFilePath: string = path.join(App.storagePath, 'logs');
    public static nmeaSentencesFile: string = path.join(App.storagePath, 'nmea_sentences.txt');

    public static BluetoothAuthToken: string = String.generateNumber(8);

    public static vdrOnly = process.env.VDR_ONLY != null && process.env.VDR_ONLY.toLowerCase() === 'true';
    public static shouldConnectWithModem = process.env.MODEM != null && process.env.MODEM.toLowerCase() === 'true';

    private app = express();
    private server = http.createServer(this.app);

    private readonly _aedes: any = aedes();
    private readonly _mqttWebSocketServer = http.createServer();
    private mqttServer = createServer(this._aedes, {ws: true});
    private mqttPort: number = +process.env.MQTT_PORT;
    private mqtt: any;

    private upload = multer({dest: App.storageUploadPath});

    constructor() {
        Log.info(Message.SERVER_STARTING);
    }

    async bootstrap(): Promise<App> {
        try {
            await SocketIO.Prepare(this.server);
            await Bootstrap();
            return this;
        } catch (e) {
            Log.error('Error while bootstrapping the application: ' + e.message);
        }
    }

    createStorageDirectories(): App {
        try {
            if (!fs.existsSync(App.storagePath)) {
                fs.mkdirSync(App.storagePath);
            }

            if (!fs.existsSync(App.storageTempPath)) {
                fs.mkdirSync(App.storageTempPath);
            }

            if (!fs.existsSync(App.storageAudioPath)) {
                fs.mkdirSync(App.storageAudioPath);
            }

            if (!fs.existsSync(App.storageFilesPath)) {
                fs.mkdirSync(App.storageFilesPath);
            }

            if (!fs.existsSync(App.storageUploadPath)) {
                fs.mkdirSync(App.storageUploadPath);
            }

            if (!fs.existsSync(App.logFilePath)) {
                fs.mkdirSync(App.logFilePath);
            }
        } catch (e) {
            Log.error('Error while creating storage directories: ' + e.message);
        }
        return this;
    }

    startProxy(): App {
        try {
            if (!App.vdrOnly) {
                ProxyService.run('127.0.0.1', 8080, 8002, true, false);
            }
        } catch (e) {
            Log.error('Error while starting the proxy: ' + e.message);
        }
        return this;
    }

    setupRouting(): App {
        try {
            this.app.use("/api", api);
            this.app.use("/", router);
        } catch (e) {
            Log.error('Error while setting up routing: ' + e.message);
        }
        return this;
    }

    setupMiddlewares(): App {
        try {
            this.app.use(MiddlewareRegistry.LogUrlMiddleware.handle);
            this.app.use(MiddlewareRegistry.CorsMiddleware.handle);
            this.app.use(bodyParser.json());
            this.app.use(bodyParser.urlencoded({extended: false}));
            this.app.use(this.upload.any());
            this.app.use("/", express.static("dist/public"));
        } catch (e) {
            Log.error('Error while setting up middlewares: ' + e.message);
        }
        return this;
    }

    setupNodeMediaServer(): App {
        try {
            if (!App.vdrOnly) {
                const app = express();
                const {proxy} = require('rtsp-relay')(app);

                const handler = proxy({
                    url: `rtsp://192.168.123.201:554/h264`,
                    verbose: false,
                });

                // @ts-ignore
                app.ws('/api/stream', handler);
                app.listen(2000);
            }
        } catch (e) {
            Log.error('Error while setting up node media server.');
            Log.error(e);
        }
        return this;
    }

    initializeProxy() {
        try {
            this.app.use("/tiles/osm/:z/:x/:y", ProxyMiddleware.osm);
        } catch (e) {
            Log.error(e);
        }
        return this;
    }

    listen(): App {
        this.server.listen(process.env.HTTP_PORT, +process.env.HTTP_HOST, () => {
            Log.info(Message.SERVER_LISTEN_AT + ' ' + process.env.HTTP_HOST + ':' + process.env.HTTP_PORT);
        });
        if (!App.vdrOnly) {
            this.mqtt = net.createServer(this._aedes.handle);
            ws.createServer({server: this._mqttWebSocketServer}, this._aedes.handle);
            this.mqtt.listen(this.mqttPort, async () => {
                this.mqttServer.listen(+process.env.MQTT_PORT, +process.env.HTTP_HOST);
                Log.info(Message.MQTT_STARED);
            });
            this._mqttWebSocketServer.listen(8883, +process.env.HTTP_HOST, () => {
                Log.info("MQTT WebSocket server started on port 8883");
            });
        }
        return this;
    }

}

new App()
    .createStorageDirectories()
    .bootstrap().then(async app => {
    app
        .setupMiddlewares()
        .setupRouting()
        .setupNodeMediaServer()
        .initializeProxy()
        .startProxy()
        .listen();
});
