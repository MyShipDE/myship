import {Bridge} from "../modals/Bridge";
import request from "superagent";
import mqtt from "mqtt";
import {Storage} from "../DatabaseProvider";
import {SocketIO} from "./socket.io/SocketIO";
import {SocketChannel} from "../resources/SocketChannel";
import {ShellySwitchDetails} from "../modals/ShellySwitchDetails";
import {DeviceService} from "./deviceService";
import {BridgeIdentifier} from "./BridgeService";
import {CustomEvent} from "./CustomEvent";
import {ElectricityConsumptionService} from "./ElectricityConsumptionService";
import {Log} from "./helpers/Log";

export class ShellyService {

    static async control(bridge: Bridge, isOn: boolean) {
        try {
            const state = isOn ? 'on' : 'off';
            const url = `http://${bridge.ip}/relay/0?turn=${state}`;
            const res = await request.get(url)
            if (res.status === 200) {
                return true;
            }
        } catch (e) {
            return false;
        }
    }

    static async getState(bridge: Bridge): Promise<boolean> {
        try {
            const url = `http://${bridge.ip}/relay/0`;
            const res = await request
                .get(url)
                .timeout({response: 4000, deadline: 6000});
            if (res.status === 200) {
                return res.body.ison;
            }
        } catch (e) {
            return false;
        }
    }

    static async isOnline(bridge: Bridge) {
        try {
            const url = `http://${bridge.ip}/relay/0`;
            await request
                .get(url)
                .timeout({response: 2000, deadline: 4000});
            return true;
        } catch (e) {
            return false;
        }
    }

    static async listenForStateChanges(bridge: Bridge) {
        try {

            const client = mqtt.connect('mqtt://192.168.123.253');

            client.subscribe([
                `${bridge.name}/status/switch:0`
            ]);

            client.on('connect', () => {
                Log.info('MQTT-Client zum lauschen vom Shelly-Status verbunden.');
            });

            client.on('message', async (topic, message) => {
                const data = JSON.parse(message.toString());

                if (data.aenergy != null) {
                    bridge.totalConsumption = data.aenergy.total;
                    await bridge.save();
                }

                for (const device of bridge.devices) {
                    // tslint:disable-next-line:triple-equals
                    if (device.isActive != data.output) {
                        device.isActive = data.output;
                        SocketIO.emit(SocketChannel.DeviceManagedObject, device);
                        await device.save();
                    }
                }

                if (bridge.name.toLowerCase().includes('battery')) {
                    const ledRelay = await Storage.getInstance().Device.findOneBy({id: +process.env.LED_POWERSUPLY_ID});
                    if (data.output && !ledRelay.isActive) {
                        await DeviceService.control(ledRelay.id);
                    }
                }

            });

        } catch (e) {
            return false;
        }
    }

    async listenOnPowerDown() {
        CustomEvent.PowerDisconnectObserver.subscribe(() => {
            ElectricityConsumptionService.Instance.saveBridgeValue();
        });
    }

    static async getSwitchDetails(bridge: Bridge): Promise<ShellySwitchDetails> {
        try {
            const url = `http://${bridge.ip}/rpc/Switch.GetStatus?id=0`;
            const res = await request.get(url)
            if (res.status === 200) {
                return Object.assign(new ShellySwitchDetails(), res.body);
            }
        } catch (e) {
            return null;
        }
    }

    static async ensureStatesInactive() {
        const bridgeType = await Storage.getInstance().BridgeType.findOne({
            relations: {
                bridges: {
                    devices: true
                }
            },
            where: {
                identifier: BridgeIdentifier.bridge220v1cShelly
            }
        });

        for (const bridge of bridgeType.bridges) {
            for (const device of bridge.devices) {
                device.isActive = false;
                await device.save();
            }
        }

    }

}
