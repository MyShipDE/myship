import request from 'superagent';
import dotenv from 'dotenv';
import {LocalStorage} from "node-localstorage";
import {String} from "./helpers/String";
import {networkInterfaces} from 'os';
import {Log} from "./helpers/Log";
import {TrackDataKey} from "../modals/TrackDataKey";
import {Message} from "../resources/Message";
import {App} from "../app";
import {VoiceEntry} from "../modals/VoiceEntry";
import {Track} from "../modals/Track";
import { io } from "socket.io-client";
import {WebSocketGatewayResources, WebSocketGatewayTrackRecordReceived} from "../classes/WebSocketGatewayResources";

dotenv.config();

export class CloudService {

    private static _Instance: CloudService;
    private readonly host: string = 'prod-be.myship.cloud';
    private readonly url: string = `https://${this.host}/api/v1`;
    public fingerprint: string;
    public secret: string;
    private ips: string[];

    private constructor() {
        //
    }

    static get Instance(): CloudService {
        if (this._Instance == null) {
            this._Instance = new CloudService();
        }
        return this._Instance;
    }

    async helloRequest() {
        this.loadFingerprint();
        this.loadIps();

        try {

            let res: request.Response;

            if (this.secret == null) {
                res = await request
                    .post(`${this.url}/hello`)
                    .send({
                        fingerprint: this.fingerprint,
                        ips: this.ips,
                    })
                    .set('accept', 'json');
            } else {
                res = await request
                    .post(`${this.url}/hello`)
                    .send({
                        fingerprint: this.fingerprint
                    })
                    .set('accept', 'json');
            }

            if (res != null) {
                if (res.status === 200) {

                    if (res.body.secret != null) {
                        const storage = new LocalStorage(App.storagePath);
                        this.secret = res.body.secret;
                        storage.setItem('MyShip.Cloud.Secret', this.secret);
                    }

                    Log.info('[CLOUD-SYSTEM] Verbindung erfolgreich hergestellt.');
                } else {
                    Log.error('[CLOUD-SYSTEM] Verbindung konnte nicht hergestellt werden.');
                }
            }

        } catch (err) {
            // CATCH
            Log.error('[CLOUD-SYSTEM] Verbindung konnte nicht hergestellt werden.');
        }
    }

    async postTrackDataKey(key: TrackDataKey) {
        try {

            const res = await request
                .post(`${this.url}/trackDataKey`)
                .set('Authorization', this.fingerprint)
                .send(key)
                .set('accept', 'json');

            return res.status === 200;

        } catch (err) {

            Log.error(Message.CLOUD_SIGNALK_KEYS_SYNC_FAILED);

            const error = JSON.parse(err.response.res.text);

            if (error.shortDescription.includes('trackDataKey_already_exists')) {
                return true;
            }

            return false;
        }
    }

    async postArchivedTrack(filePath: string) {
        try {

            const res = await request
                .post(`${this.url}/track`)
                .attach('file', filePath)
                .set('Authorization', this.fingerprint)
                .set('accept', 'json');

            return res.status === 200;

        } catch (e) {
            Log.error(Message.FAILED_TO_BACKUP_TRACK);
            return false;
        }
    }

    async postTrack(track: Track) {
        return new Promise<boolean>(resolve => {

            const onlyTrack = Object.assign(new Track(), track);
            onlyTrack.records = [];

            const client = io(`https://${this.host}`);

            client.on(WebSocketGatewayResources.AuthFailed, () => {
                Log.error('WebSocket Cloud Connection failed');
                client.disconnect();
            });

            client.on(WebSocketGatewayResources.AuthSuccess, async () => {

                const confirmedChunks: WebSocketGatewayTrackRecordReceived[] = [];

                client.on(WebSocketGatewayResources.ChunkOfTrackReceived, (confirmation: WebSocketGatewayTrackRecordReceived) => {
                    confirmedChunks.push(confirmation);
                });

                client.on(WebSocketGatewayResources.ImportTrackFinished, () => {
                    Log.debug('Track was uploaded successfully');
                    client.disconnect();
                    resolve(true);
                });

                client.on(WebSocketGatewayResources.ErrorWhileImportingTrack, () => {
                    Log.error('Error while backup track');
                    client.disconnect();
                    resolve(false);
                });

                client.emit(WebSocketGatewayResources.BeginImportOfTrack, onlyTrack);

                for (const record of track.records) {
                    client.emit(WebSocketGatewayResources.ChunkOfTrack, record);
                }

                const timeout = setTimeout(() => {
                    Log.error('Track upload timeout');
                    client.disconnect();
                    resolve(false);
                }, 10000 * 10);

                while (!this.validateChunks(confirmedChunks, track)) {
                    await new Promise(r => setTimeout(r, 200));
                }

                clearTimeout(timeout);

                client.emit(WebSocketGatewayResources.EndImportOfTrack);
                client.disconnect();
                resolve(true);

            });

            client.emit(WebSocketGatewayResources.AuthEvent, this.fingerprint);
        });
    }

    validateChunks(confirmedChunks: WebSocketGatewayTrackRecordReceived[], track: Track) {
        let confirmedRecords = 0;
        for (const record of track.records) {
            for (const confirmation of confirmedChunks) {
                if (record.id === confirmation.recordId) {
                    confirmedRecords++;
                    break;
                }
            }
        }
        return confirmedRecords === track.records.length;
    }

    async postUnlinkedVoiceEntry(voiceEntry: VoiceEntry) {
        try {

            const res = await request
                .patch(`${this.url}/track/voiceEntry`)
                .set('Authorization', this.fingerprint)
                .set('accept', 'json')
                .send(voiceEntry);

            return res.status === 200;

        } catch (e) {
            Log.error("Error while saving unlinked VoiceEntries");
            console.log(e);
            return false;
        }
    }

    async getTrackDataKey() {
        try {

            const res = await request
                .get(`${this.url}/trackDataKeys`)
                .set('accept', 'json');

            return res.body;

        } catch (err) {
            Log.error(Message.CLOUD_SIGNALK_KEYS_LOAD_FAILED);
            return false;
        }
    }

    loadIps() {
        this.ips = [];
        const nets = networkInterfaces();
        const results = Object.create(null); // Or just '{}', an empty object

        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
                if (net.family === familyV4Value && !net.internal) {
                    if (!results[name]) {
                        results[name] = [];
                    }
                    results[name].push(net.address);
                    this.ips.push(net.address);
                }
            }
        }
    }

    loadFingerprint() {
        const storage = new LocalStorage(App.storagePath);
        const fingerprint = storage.getItem('MyShip.Fingerprint');
        if (fingerprint == null) {
            this.fingerprint = String.generate(128);
            storage.setItem('MyShip.Fingerprint', this.fingerprint);
        } else {
            this.fingerprint = fingerprint;
        }

        const secret = storage.getItem('MyShip.Cloud.Secret');
        if (secret != null) {
            this.secret = secret;
        }
    }

}
