import {SocketIO} from "./socket.io/SocketIO";
import {Storage} from "../DatabaseProvider";
import {SocketChannel} from "../resources/SocketChannel";
import {BridgeIdentifier} from "./BridgeService";
import {TasmotaService, TasmotaState} from "./TasmotaService";
import {Actuators} from "./DemoMode/actuators/Actuators";
import {Log} from "./helpers/Log";

export class DeviceService {

    static async get() {
        return await Storage.getInstance().Device.find({
            relations: {
                bridge: {
                    type: true
                }
            }
        });
    };

    static async getOne(id: number) {
        return await Storage.getInstance().Device.findOne({
            relations: {
                bridge: {
                    type: true
                }
            },
            where: {
                id
            }
        });
    };

    static async control(id: number) {
        const device = await Storage.getInstance().Device.findOne({
            relations: {
                bridge: {
                    type: true
                }
            },
            where: {id}
        });

        if (device != null) {
            if (device.bridge.type.identifier === BridgeIdentifier.bridge220v1cSon || device.bridge.type.identifier === BridgeIdentifier.bridge12v4cSon) {
                try {
                    await Actuators.relay.tasmotaControl(device.bridge, device.bridgePort, !device.isActive);

                    device.isActive = !device.isActive;
                    SocketIO.emit(SocketChannel.DeviceManagedObject, device);

                    await device.save();

                    return true;
                } catch (e) {
                    return false;
                }
            } else if (device.bridge.type.identifier === BridgeIdentifier.bridge220v1cShelly) {
                try {
                    await Actuators.relay.shellyControl(device.bridge, !device.isActive);

                    device.isActive = !device.isActive;
                    SocketIO.emit(SocketChannel.DeviceManagedObject, device);

                    await device.save();
                    return true;
                } catch (e) {
                    return false;
                }
            }
        }

        return false;
    }

    static async checkPortChanges() {

        const devices = await Storage.getInstance().Device.find({
            relations: {
                bridge: {
                    type: true
                }
            }
        });

        const tasmotaDevices = devices.filter(x => x.bridge != null && x.bridge.type.identifier === BridgeIdentifier.bridge12v4cSon.toString());

        for (const device of tasmotaDevices) {
            const state = await TasmotaService.getStateOfPort(device.bridge, device.bridgePort);

            const boolState = state === TasmotaState.Activated;

            if (device.isActive !== boolState) {
                device.isActive = boolState;
                await device.save();
                SocketIO.emit(SocketChannel.DeviceManagedObject, device);
            }

        }

    }

}
