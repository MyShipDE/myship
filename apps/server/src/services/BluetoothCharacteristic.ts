import {BluetoothResources} from "../resources/BluetoothResources";
import {App} from "../app";
import {Client} from "../modals/Client";
import {Storage} from "../DatabaseProvider";
import {SignalKHelper} from "./helpers/SignalKHelper";

export class BluetoothCharacteristic {

    private static dataKey?: string;

    /**
     * Lazily builds the BLE characteristics. The native `bleno` binding is only
     * required here, so importing this module never loads it — important for
     * demo mode and non-RPi hosts where bleno isn't built.
     */
    static build(): any[] {
        // tslint:disable-next-line:no-var-requires
        const bleno = require('@abandonware/bleno');
        const BlenoCharacteristic = bleno.Characteristic;

        const authCharacteristic = new BlenoCharacteristic({
            uuid: BluetoothResources.UUIDs.auth,
            properties: ['write'],
            value: null,

            // Expected data format: "token:clientUuid"
            onWriteRequest: async (data: Buffer, offset: number, withoutResponse: boolean, callback: (code: number) => void) => {
                const receivedData = data.toString('utf-8').split(':');
                const receivedToken = receivedData[0];
                const clientUuid = receivedData[1];

                if (await Storage.getInstance().Client.exists({where: {uuid: clientUuid}})) {
                    callback(BlenoCharacteristic.RESULT_SUCCESS);
                    return;
                }

                if (receivedToken === App.BluetoothAuthToken) {
                    const client = new Client();
                    client.uuid = clientUuid;
                    client.isAdmin = true;
                    await client.save();
                    callback(BlenoCharacteristic.RESULT_SUCCESS);
                } else {
                    callback(BlenoCharacteristic.RESULT_UNLIKELY_ERROR);
                }
            }
        });

        const requestCharacteristic = new BlenoCharacteristic({
            uuid: BluetoothResources.UUIDs.data,
            properties: ['write', 'read'],
            value: null,

            // Expected data format: "clientUuid:dataKey"
            onWriteRequest: async (data: Buffer, offset: number, withoutResponse: boolean, callback: (code: number) => void) => {
                const receivedData = data.toString('utf-8').split(':');
                const clientUuid = receivedData[0];
                const dataKey = receivedData[1];

                if (await Storage.getInstance().Client.exists({where: {uuid: clientUuid}}) === false) {
                    callback(BlenoCharacteristic.RESULT_UNLIKELY_ERROR);
                    return;
                }

                const dataList = SignalKHelper.getInstance().cachedData;
                const item = dataList.find(x => x.path === dataKey);

                if (item !== undefined) {
                    BluetoothCharacteristic.dataKey = item.path;
                    callback(BlenoCharacteristic.RESULT_SUCCESS);
                } else {
                    callback(BlenoCharacteristic.RESULT_UNLIKELY_ERROR);
                }
            },

            onReadRequest: (offset: number, callback: (code: number, data?: Buffer) => void) => {
                if (BluetoothCharacteristic.dataKey === undefined) {
                    callback(BlenoCharacteristic.RESULT_UNLIKELY_ERROR);
                    return;
                }

                const dataList = SignalKHelper.getInstance().cachedData;
                const item = dataList.find(x => x.path === BluetoothCharacteristic.dataKey);

                if (item === undefined) {
                    callback(BlenoCharacteristic.RESULT_UNLIKELY_ERROR);
                    return;
                }

                const data = Buffer.from(item.value, 'utf-8');
                callback(BlenoCharacteristic.RESULT_SUCCESS, data);
            }
        });

        return [authCharacteristic, requestCharacteristic];
    }

}
