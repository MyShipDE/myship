import {Light} from '../modals/Light';
import controlLightService from './controlLightService'
import {SocketIO} from "./socket.io/SocketIO";
import {Storage} from "../DatabaseProvider";
import {SocketChannel} from "../resources/SocketChannel";
import {ShellyService} from "./ShellyService";
import {DeviceService} from "./deviceService";
import {TasmotaService, TasmotaState} from "./TasmotaService";

const getAll = async () => {
    return await Storage.getInstance().Light.find();
};

const get = async (id: number) => {
    if (id !== undefined) {
        return await Storage.getInstance().Light.findOneBy({id});
    }
    return false;
};

const create = async (name: string, bridgeId: number, bridgePort: number) => {
    const obj = {
        name,
        bridge_id: bridgeId,
        bridge_port: bridgePort
    };
    const query = await Light.create(obj);
    if (query != null) {
        return query;
    }
    return false;
}

const update = async (id: number, name: string, bridgeId: number, bridgePort: number) => {
    const light = await Storage.getInstance().Light.findOneBy({id});
    if (light != null) {
        light.name = name;
        return await light.save();
    }
    return false;
}

const remove = async (id: number) => {
    // const groups = await Light.groups(id);
    // const scenes = await Light.scenes(id);
    // for (let group of groups) {
    //     await LightGroup.unlink(id, group.id);
    // }
    // for (let scene of scenes) {
    //     await Scene.unlink(id, scene.id);
    // }
    // const query = await Light.remove(id);
    // if (query != null) {
    //     return query;
    // }
    return false;
}

const control = async (id: number, r: number, g: number, b: number, brightness: number) => {
    const nightMode = await Storage.getInstance().Setup.findOneBy({name: 'light.nightMode.state'});
    const light = await Storage.getInstance().Light.findOneBy({id});
    if (light != null) {
        if (
            await controlLightService(
                light.host,
                r,
                g,
                b,
                brightness
            )
        ) {
            if (r === 0 && g === 0 && b === 0) {
                light.isActive = false;
            } else {
                light.isActive = true;
                light.R = r;
                light.G = g;
                light.B = g;
                light.BRI = brightness;
            }

            SocketIO.emit(SocketChannel.LightManagedObject, light);

            if (nightMode.boolValue) {
                nightMode.boolValue = false;
                await nightMode.save();
                SocketIO.emit(SocketChannel.NightModeStateManagedObject, false);
            }

            return true;
        }
    }
    return false;
};

const getNightMode = async () => {
    return await Storage.getInstance().Setup.findOneBy({name: 'light.nightMode.state'});
};

const enableNightMode = async () => {
    //
};

const disableNightMode = async () => {
    //
};

const resetLightStateIfRelayOff = async () => {
    const relay = await Storage.getInstance().Device.findOneBy({id: +process.env.LED_POWERSUPLY_ID});
    if (relay == null) {
        return false;
    }

    if (!relay.isActive) {
        const lights = await Storage.getInstance().Light.find();
        for (const light of lights) {
            light.isActive = false;
            await light.save();
        }
    }
};

const disablePowerSupplyIfPossible = async () => {
    const bridges = await Storage.getInstance().Bridge.find();
    const bridge = bridges.find(x => x.name.toLowerCase().includes('battery'));
    if (bridge != null && !(await ShellyService.getState(bridge))) {
        const lights = await Storage.getInstance().Light.count({
            where: {
                isActive: true
            }
        });
        if (lights === 0) {
            const ledRelay = await Storage.getInstance().Device.findOne({
                relations: {
                    bridge: true
                },
                where: {id: +process.env.LED_POWERSUPLY_ID}
            });
            if (ledRelay.isActive) {
                await TasmotaService.control(ledRelay.bridge, ledRelay.bridgePort, false);
            }
        }
    }
}

const enablePowerSupplyIfPossible = async () => {
    const bridges = await Storage.getInstance().Bridge.find();
    const bridge = bridges.find(x => x.name.toLowerCase().includes('battery'));
    if (bridge != null && (await ShellyService.getState(bridge))) {
        const ledRelay = await Storage.getInstance().Device.findOne({
            relations: {
                bridge: true
            },
            where: {id: +process.env.LED_POWERSUPLY_ID}
        });
        if (!ledRelay.isActive) {
            await TasmotaService.control(ledRelay.bridge, ledRelay.bridgePort, true);
        }
    }
}

export default {
    getAll,
    get,
    control,
    getNightMode,
    enableNightMode,
    disableNightMode,
    create,
    update,
    remove,
    resetLightStateIfRelayOff,
    disablePowerSupplyIfPossible,
    enablePowerSupplyIfPossible
}
