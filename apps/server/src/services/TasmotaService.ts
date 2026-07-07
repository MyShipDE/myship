import {Bridge} from "../modals/Bridge";
import request from "superagent";
import mqtt from "mqtt";
import {Log} from "./helpers/Log";
import {Storage} from "../DatabaseProvider";
import {SocketIO} from "./socket.io/SocketIO";
import {SocketChannel} from "../resources/SocketChannel";

export class TasmotaService {

    static async getStateOfPort(bridge: Bridge, port: number): Promise<TasmotaState> {
        try {
            const url = `http://${bridge.ip}/cm?cmnd=Power${port}`;
            const res = await request
                .get(url)
                .timeout({response: 4000, deadline: 6000});
            if (res.status === 200) {
                const firstAttribute = Object.values(res.body)[0];
                if (firstAttribute === 'ON') {
                    return TasmotaState.Activated;
                } else {
                    return TasmotaState.Deactivated;
                }
            } else {
                Log.error(`Die Bridge: ${bridge.name} (${bridge.ip}) ist nicht erreichbar!`);
                return TasmotaState.Offline;
            }
        } catch (e) {
            Log.error(`Die Bridge: ${bridge.name} (${bridge.ip}) ist nicht erreichbar!`);
            return TasmotaState.Offline;
        }
    }

    static async control(bridge: Bridge, port: number, state: boolean): Promise<boolean> {
        try {
            let customState: TasmotaState;
            if (state) {
                customState = TasmotaState.Activated;
            } else {
                customState = TasmotaState.Deactivated;
            }

            if (await this.getStateOfPort(bridge, port) !== customState) {
                const res = await request
                    .get('http://' + bridge.ip + '/?m=1&o=' + port)
                    .timeout({response: 4000, deadline: 6000});
                return res.status === 200;
            }
        } catch (e) {
            return false;
        }
        return false;
    }

    static listenOnStateChanges() {
        const client = mqtt.connect('mqtt://192.168.123.253');

        client.subscribe([
            'tele/#'
        ]);

        client.on('message', async (topic, message) => {
            const topicArr = topic.split('/');
            if (topicArr.length === 3) {
                if (topicArr[0] === 'tele' && topicArr[2] === 'STATE') {
                    Log.debug('New MQTT Message: ' + topic);
                    const json = JSON.parse(message.toString());
                    const nameArr = topicArr[1].split('_');

                    if (nameArr.length === 3 && json != null) {

                        const ip = '192.168.123.' + nameArr[2];
                        const bridge = await Storage.getInstance().Bridge.findOneBy({ip});

                        if (bridge != null && topicArr[1].includes("12V")) {
                            await this.SetStatusByPort(bridge.id, 1, json.POWER1 === 'ON');
                            await this.SetStatusByPort(bridge.id, 2, json.POWER2 === 'ON');
                            await this.SetStatusByPort(bridge.id, 3, json.POWER3 === 'ON');
                            await this.SetStatusByPort(bridge.id, 4, json.POWER4 === 'ON');
                            SocketIO.emit(SocketChannel.DeviceManagedObject, await this.GetByPortAndBridge(bridge.id, 1));
                            SocketIO.emit(SocketChannel.DeviceManagedObject, await this.GetByPortAndBridge(bridge.id, 2));
                            SocketIO.emit(SocketChannel.DeviceManagedObject, await this.GetByPortAndBridge(bridge.id, 3));
                            SocketIO.emit(SocketChannel.DeviceManagedObject, await this.GetByPortAndBridge(bridge.id, 4));
                        }

                    }

                }
            }
        });
    }

    static async SetStatusByPort(bridgeId: number, bridgePort: number, status: boolean) {
        const bridge = await Storage.getInstance().Bridge.findOne({
            relations: {
                devices: true
            },
            where: {
                id: bridgeId
            }
        });
        const device = bridge.devices.find(x => x.bridgePort === bridgePort);
        if (device != null) {
            device.isActive = status;
            await device.save();
        }
    }

    static async GetByPortAndBridge(bridgeId: number, bridgePort: number) {
        const bridge = await Storage.getInstance().Bridge.findOne({
            relations: {
                devices: true
            },
            where: {
                id: bridgeId
            }
        });
        return bridge.devices.find(x => x.bridgePort === bridgePort);
    }

}

export enum TasmotaState {
    Activated,
    Deactivated,
    Offline
}
