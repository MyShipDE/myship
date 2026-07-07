import bleno from "@abandonware/bleno";
import {BluetoothResources} from "../resources/BluetoothResources";
import {App} from "../app";
import {Client} from "../modals/Client";
import {Storage} from "../DatabaseProvider";
import {SignalKHelper} from "./helpers/SignalKHelper";

export class BluetoothCharacteristic {

    private static readonly BlenoCharacteristic = bleno.Characteristic;

    static authCharacteristic = new this.BlenoCharacteristic({
        uuid: BluetoothResources.UUIDs.auth,
        properties: ['write'],
        value: null,

        // Expected data format: "token:clientUuid"
        onWriteRequest: async (data, offset, withoutResponse, callback) => {
            const receivedData = data.toString('utf-8').split(':');
            const receivedToken = receivedData[0];
            const clientUuid = receivedData[1];

            if (await Storage.getInstance().Client.exists({where: {uuid: clientUuid}})) {
                callback(this.BlenoCharacteristic.RESULT_SUCCESS);
                return;
            }

            if (receivedToken === App.BluetoothAuthToken) {
                const client = new Client();
                client.uuid = clientUuid;
                client.isAdmin = true;
                await client.save();
                callback(this.BlenoCharacteristic.RESULT_SUCCESS);
            } else {
                callback(this.BlenoCharacteristic.RESULT_UNLIKELY_ERROR);
            }
        }
    });

    private static dataKey?: string;
    static requestCharacteristic = new this.BlenoCharacteristic({
        uuid: BluetoothResources.UUIDs.data,
        properties: ['write', 'read'],
        value: null,

        // Expected data format: "clientUuid:dataKey"
        onWriteRequest: async (data, offset, withoutResponse, callback) => {
            const receivedData = data.toString('utf-8').split(':');
            const clientUuid = receivedData[0];
            const dataKey = receivedData[1];

            if (await Storage.getInstance().Client.exists({where: {uuid: clientUuid}}) === false) {
                callback(this.BlenoCharacteristic.RESULT_UNLIKELY_ERROR);
                return;
            }

            const dataList = SignalKHelper.getInstance().cachedData;
            const item = dataList.find(x => x.path === dataKey);

            if (item !== undefined) {
                this.dataKey = item.path;
                callback(this.BlenoCharacteristic.RESULT_SUCCESS);
            } else {
                callback(this.BlenoCharacteristic.RESULT_UNLIKELY_ERROR);
            }
        },

        onReadRequest: (offset, callback) => {
            if (this.dataKey === undefined) {
                callback(this.BlenoCharacteristic.RESULT_UNLIKELY_ERROR);
                return;
            }

            const dataList = SignalKHelper.getInstance().cachedData;
            const item = dataList.find(x => x.path === this.dataKey);

            if (item === undefined) {
                callback(this.BlenoCharacteristic.RESULT_UNLIKELY_ERROR);
                return;
            }

            const data = Buffer.from(item.value, 'utf-8');
            callback(this.BlenoCharacteristic.RESULT_SUCCESS, data);
        }
    });

}