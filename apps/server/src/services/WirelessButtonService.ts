import mqtt from 'mqtt';
import {Log} from "./helpers/Log";
import {SocketIO} from "./socket.io/SocketIO";
import {AudioRecorderService} from "./AudioRecorderService";
import {SocketChannel} from "../resources/SocketChannel";

export class WirelessButtonService {

    private static _Instance: WirelessButtonService;

    private client;

    constructor() {
        this.client = mqtt.connect('mqtt://127.0.0.1');
    }

    listen(): void {
        this.client.on('connect', () => {
            Log.debug('MQTT-Client zum lauschen der Wireless-Buttons wurde aufgebaut!');
            this.client.subscribe([
                'wirelessSwitch/01/state',
            ]);
        })
        this.client.on('message', async (topic, message) => {
            const state: any = JSON.parse(message.toString());
            Log.debug('Receive MQTT-Message from WirelessButton - State: ' + state);
            SocketIO.emit(SocketChannel.AudioRecordStateObject, state);

            if (state && !AudioRecorderService._state) {
                // Start Record
                AudioRecorderService.prepare();
                await AudioRecorderService.start();
            } else if (AudioRecorderService._state) {
                // Stop Record
                AudioRecorderService.stop();
            }

        });
    }

    static get Instance() {
        if (this._Instance == null) this._Instance = new WirelessButtonService();
        return this._Instance;
    }

}
