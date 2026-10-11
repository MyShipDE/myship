import {Log} from "./helpers/Log";
import {BluetoothResources} from "../resources/BluetoothResources";
import {App} from "../app";
import {BluetoothCharacteristic} from "./BluetoothCharacteristic";

export class BluetoothService {

    private static _Instance: BluetoothService;

    private deviceName = 'VDR';

    setup() {
        Log.info('BluetoothService wird gestartet...');
        Log.info(`Bluetooth - Authorization-Token: ${App.BluetoothAuthToken}`);
        this.defineEvents();
    }

    private defineEvents() {
        // Load the native bleno binding lazily — only on a real RPi where it's
        // built. Importing this service must never pull the native module.
        // tslint:disable-next-line:no-var-requires
        const bleno = require('@abandonware/bleno');
        const BlenoPrimaryService = bleno.PrimaryService;

        bleno.on('stateChange', (state: string) => {
            if (state === 'poweredOn') {
                Log.info('Bluetooth ist eingeschaltet, Starte Werbung...');
                bleno.startAdvertising(this.deviceName, [BluetoothResources.UUIDs.service]);
            } else {
                Log.info('Bluetooth ist ausgeschaltet.');
                bleno.stopAdvertising();
            }
        });

        bleno.on('advertisingStart', (error: any) => {
            if (!error) {
                Log.info('Werbung erfolgreich gestartet');
                bleno.setServices([
                    new BlenoPrimaryService({
                        uuid: BluetoothResources.UUIDs.service,
                        characteristics: BluetoothCharacteristic.build(),
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
