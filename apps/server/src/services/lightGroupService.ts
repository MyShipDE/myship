import {LightGroup} from '../modals/LightGroup';
import controlLightService from './controlLightService';
import {SocketIO} from "./socket.io/SocketIO";
import {Storage} from "../DatabaseProvider";
import {SocketChannel} from "../resources/SocketChannel";
import LightService from "./lightService";
import {SettingsService} from "./SettingsService";
import {DataRegistryName} from "../resources/RegistryProperties";

const getAll = async () => {
    const groups = await Storage.getInstance().LightGroup.find({
        relations: {
            lights: true,
            scenes: true
        }
    });
    return groups;
}

const getLights = async (groupId: number) => {
    const lightGroup = await Storage.getInstance().LightGroup.findOne({
        relations: {
            lights: true
        },
        where: {id: groupId}
    })
    return lightGroup.lights;
}

const getOne = async (id: number) => {
    const group = await Storage.getInstance().LightGroup.findOne({
        relations: {
            lights: true
        },
        where: {id}
    });
    if (group != null) {
        return group;
    }
    return false;
}

const create = async (name: string) => {
    const lightGroup = new LightGroup();
    lightGroup.name = name;
    return await lightGroup.save();
}

const remove = async (id: number) => {
    try {
        const lightGroup = await Storage.getInstance().LightGroup.findOneBy({id});
        await lightGroup.remove();
        return true;
    } catch (e) {
        return false;
    }
}

const link = async (lightId: number, groupId: number) => {
    try {
        const lightGroup = await Storage.getInstance().LightGroup.findOne({
            relations: {
                lights: true
            },
            where: {id: groupId}
        });
        const light = await Storage.getInstance().Light.findOneBy({id: lightId});
        lightGroup.lights.push(light);
        await lightGroup.save();
        return true;
    } catch (e) {
        return false;
    }
}

const unlink = async (lightId: number, groupId: number) => {
    try {
        const lightGroup = await Storage.getInstance().LightGroup.findOne({
            relations: {
                lights: true
            },
            where: {id: groupId}
        });
        lightGroup.lights = lightGroup.lights.filter(light => light.id !== lightId);
        await lightGroup.save();
        return true;
    } catch (e) {
        return false;
    }
}

const control = async (id: number, r: number, g: number, b: number, brightness: number) => {
    const lightGroup = await Storage.getInstance().LightGroup.findOne({
        relations: {
            lights: true
        },
        where: {id}
    });

    await SettingsService.Instance.pull();
    const nightMode = SettingsService.Instance.findProperty(DataRegistryName.NightModeState);

    for (const light of lightGroup.lights) {

        if (nightMode.value && r !== 0 && g !== 0 && b !== 0) {
            await controlLightService(light.host, 255, 0, 0, 120);
        } else {
            await controlLightService(light.host, r, g, b, brightness);
        }

        if (r === 0 && g === 0 && b === 0) {
            light.isActive = false;
        } else {
            light.isActive = true;
            light.R = r;
            light.G = g;
            light.B = g;
            light.BRI = brightness;
        }
        await light.save();
        SocketIO.emit(SocketChannel.LightGroupManagedObject, light);
    }

    await lightGroup.save();

    // Set LED Power-Supply Off
    LightService.disablePowerSupplyIfPossible().then();

    return true;
}

const selectScene = async (groupId: number, sceneId: number) => {
    const lightGroup = await Storage.getInstance().LightGroup.findOne({
        relations: {
            lights: true
        },
        where: {id: groupId}
    });
    const scene = await Storage.getInstance().Scene.findOneBy({id: sceneId});

    if (lightGroup != null && lightGroup.lights != null && scene != null) {
        lightGroup.lastSceneId = scene.id;
        for (const light of lightGroup.lights) {
            await controlLightService(light.host, scene.R, scene.G, scene.B, scene.BRI);
            light.isActive = true;
            light.R = scene.R;
            light.G = scene.G;
            light.B = scene.B;
            light.BRI = scene.BRI;
            SocketIO.emit(SocketChannel.LightGroupManagedObject, light);
        }
        return true;
    }

    return false;
}

export default {
    getAll,
    getOne,
    create,
    remove,
    link,
    unlink,
    control,
    selectScene,
    getLights
}
