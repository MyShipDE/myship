import request, {post} from "superagent";
import {Log} from "./Log";
import {Message} from "../../resources/Message";
import {Bearer} from 'superagent-authorization';
import WebSocket from "ws";
import * as process from "process";
import {SignalKBlacklist} from "../../classes/SignalKBlacklist";
import {SignalKDataSet} from "../../classes/SignalKDataSet";
import {TrackDataKey} from "../../modals/TrackDataKey";
import {NumberHelper} from "./NumberHelper";
import {SignalKIdentifier} from "../../classes/SignalKIdentifier";
import validator from "validator";

export class SignalKHelper {

    private static Instance: SignalKHelper;

    private url: string = process.env.SIGNALK_HOST || '127.0.0.1';
    private port: number = +process.env.SIGNALK_PORT || 3000;
    private uuid: string;
    private socket: WebSocket;

    public cachedData: SignalKDataSet[] = [];
    public gpsSentences: string[] = [];

    constructor() {
        Log.info(`Aktuell verwendeter SignalK-Server: ${this.url}:${this.port}`)
    }

    async getByPath<T>(path: string, returnUnit = false): Promise<T> {
        try {

            if (path == null || path === ''
                || path.includes(SignalKIdentifier.navigationSatellitesInView)) {
                return null;
            }

            const formatPath = path.replace(/\./g, '/');

            if (this.uuid == null) {
                const all = await request
                    .get(`http://${this.url}:${this.port}/signalk/v1/api/vessels`);
                this.uuid = Object.keys(all.body)[0];
            }

            const result = await request
                .get(`http://${this.url}:${this.port}/signalk/v1/api/vessels/${this.uuid}/${formatPath}`);

            if (returnUnit) {
                if (result.body != null && result.body.meta != null && result.body.meta.units != null) {
                    return result.body.meta.units;
                }
                return null;
            }

            return result.body.value;
        } catch (e) {
            /* if (returnUnit) {
                Log.debug(`Die Einheit von ${path} konnte nicht geladen werden!`);
            } else {
                Log.debug(`Der Wert von ${path} konnte nicht geladen werden!`);
            } */
            return null;
        }
    }

    async restart(): Promise<void> {

        try {
            const login = await request
                .post(`http://${this.url}:${this.port}/signalk/v1/auth/login`)
                .timeout(3000)
                .send({username: 'admin', password: 'Werkhausen.123', rememberMe: true});

            const token = login.body.token;

            const restartQuery = await request
                .put(`http://${this.url}:${this.port}/skServer/restart`)
                .timeout(3000)
                .use(Bearer(token));

        } catch (e) {
            Log.error('Der SignalK-Server konnte nicht neugestartet werden!');
            Log.debug(e);
        }

    }

    handleAndCacheData(): void {
        try {
            this.socket = new WebSocket(`ws://${process.env.SIGNALK_HOST}:${process.env.SIGNALK_PORT}/signalk/v1/stream?subscribe=all`);

            this.socket.addEventListener('open', async (event) => {
                Log.info('SignalK Verbindung (over WebSocket) wurde hergestellt!');
            });

            this.socket.addEventListener('close', async (event) => {
                Log.info('SignalK Verbindung (over WebSocket) wurde geschlossen!');
                this.socket.close();
                this.socket = null;
                this.handleAndCacheData();
            });

            this.socket.addEventListener('message', async (event) => {
                const data = JSON.parse(event.data.toString());

                if (data == null || data.updates == null) {
                    return;
                }

                await this.saveUpdate(data.updates);

            });
        } catch (e) {
            Log.error('Keine Verbindung zum SignalK Server via WebSockets!');
        }
    }

    async saveUpdate(updates: any[]) {
        for (const update of updates) {

            for (const data1 of update.values) {

                if (data1.path != null && data1.path !== '') {

                    /* if (data1.path.includes('satellites') && update.source?.talker !== 'GP') {
                        continue;
                    } */

                    if (typeof data1.value === 'number' || typeof data1.value === 'string') {
                        if (this.isPathAllowed(data1.path)) {
                            // Log.debug(`${data1.path} (${data1.value}) is cached`);
                            await this.ensureDataIsCached(data1.path, data1.value);
                        }
                    } else if (data1.value !== undefined && typeof data1.value === 'object') {
                        for (const key in data1.value) {
                            if (this.isPathAllowed(`${data1.path}.${key}`)) {
                                await this.ensureDataIsCached(`${data1.path}.${key}`, `${data1.value[key]}`);
                                // Log.debug(`${data1.path}.${key} (${data1.value[key]}) is cached`);
                                /* if (data1.path.includes('satellites')) {
                                    const value = JSON.stringify(data1.value[key]);
                                    await this.ensureDataIsCached(`${data1.path}.${key}`, `${value}`);
                                } else {
                                    await this.ensureDataIsCached(`${data1.path}.${key}`, `${data1.value[key]}`);
                                } */
                            }
                        }
                    } else {
                        Log.warn('Unbekannter Datentyp aus SignalK erhalten!');
                        Log.debug('Pfad: ' + data1.path + ' | Wert: ' + JSON.stringify(data1.value));
                    }

                }

            }
        }
        // Log.debug(`Count of Cache: ${this.cachedData.length}`);
    }

    isPathAllowed(path: string) {
        for (const blacklist of SignalKBlacklist) {
            if (path.startsWith(blacklist)) {
                return false;
            }
        }
        return !SignalKBlacklist.includes(path);
    }

    async ensureDataIsCached(path: string, value: any) {

        if (path == null || path === '') {
            return;
        }

        let data = this.cachedData.find(x => x.path === path);

        if (data != null) {
            this.cachedData.map(x => {
                if (x.path === path) {
                    x.value = value;
                    x.lastUpdate = new Date();
                }
            });
        } else {

            const valueAsString = value.toString();
            // const isSatellitesData = path.includes('satellites') && validator.isJSON(value);

            if ((valueAsString === '' || valueAsString.includes('-'))) {
                return;
            }

            const unit = await this.getByPath<string>(path, true);

            data = {
                path,
                value: +value,
                unit: unit != null ? unit : '',
                lastUpdate: new Date()
            }
            if (NumberHelper.isValid(data.value)) {
                this.cachedData.push(data);
            }
        }
    }

    async fixPathNames() {
        const keys = await TrackDataKey.find();
        for (const key of keys) {
            if (key.identifier.endsWith('.value')) {
                key.identifier = key.identifier.replace('.value', '');
                await key.save();
            }
        }
    }

    static getInstance(): SignalKHelper {
        if (this.Instance == null) this.Instance = new SignalKHelper();
        return this.Instance;
    }

}
