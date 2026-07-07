import bleno from '@abandonware/bleno';
import {Log} from "./helpers/Log";
import {BluetoothResources} from "../resources/BluetoothResources";
import {App} from "../app";
import {BluetoothCharacteristic} from "./BluetoothCharacteristic";

export class BluetoothService {

    private static _Instance: BluetoothService;

    private readonly BlenoPrimaryService = bleno.PrimaryService;

    private deviceName = 'VDR';

    setup() {
        Log.info('BluetoothService wird gestartet...');
        Log.info(`Bluetooth - Authorization-Token: ${App.BluetoothAuthToken}`);
        this.defineEvents();
    }

    private defineEvents() {
        bleno.on('stateChange', (state) => {
            if (state === 'poweredOn') {
                Log.info('Bluetooth ist eingeschaltet, Starte Werbung...');
                bleno.startAdvertising(this.deviceName, [BluetoothResources.UUIDs.service]);
            } else {
                Log.info('Bluetooth ist ausgeschaltet.');
                bleno.stopAdvertising();
            }
        });

        bleno.on('advertisingStart', (error) => {
            if (!error) {
                Log.info('Werbung erfolgreich gestartet');
                bleno.setServices([
                    new this.BlenoPrimaryService({
                        uuid: BluetoothResources.UUIDs.service,
                        characteristics: [
                            BluetoothCharacteristic.authCharacteristic,
                            BluetoothCharacteristic.requestCharacteristic
                        ],
                    }),
                ]);
            } else {
                console.log('Fehler beim Start der Werbung:', error);
            }
        });

    }

    static getInstance() {
        if (this._Instance == null) this._Instance = new BluetoothService();
        return this._Instance;
    }

}
