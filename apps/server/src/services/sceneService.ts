import {Scene} from '../modals/Scene';
import {SocketIO} from "./socket.io/SocketIO";
import {Storage} from "../DatabaseProvider";
import {SocketChannel} from "../resources/SocketChannel";

const get = async (id: number) => {
    return (await Storage.getInstance().LightGroup.findOne({
        relations: {
            scenes: true
        },
        where: {
            id
        }
    })).scenes;
};

const getOne = async (id: number) => {
    return await Storage.getInstance().Scene.findOneBy({id});
};

const deleteScene = async (id: number) => {
    try {
        const scene = await Storage.getInstance().Scene.findOneBy({id});
        await scene.remove();

        SocketIO.emit(SocketChannel.SceneManagedNotification, null);

        return true;
    } catch (e) {
        return false;
    }
};

const create = async (obj: any) => {
    try {
        const scene = new Scene();
        scene.name = obj.name;
        scene.R = obj.r;
        scene.G = obj.g;
        scene.B = obj.b;
        scene.BRI = obj.brightness;
        await scene.save();
        return true;
    } catch (e) {
        return false;
    }
};

const update = async (obj: any) => {
    try {
        const scene = await Storage.getInstance().Scene.findOneBy({id: obj.id});
        scene.name = obj.name;
        scene.R = obj.r;
        scene.G = obj.g;
        scene.B = obj.b;
        scene.BRI = obj.brightness;
        await scene.save();
        return true;
    } catch (e) {
        return false;
    }
};

const link = async (groupId: number, sceneId: number) => {
    const lightGroup = await Storage.getInstance().LightGroup.findOneBy({id: groupId});
    const scene = await Storage.getInstance().Scene.findOneBy({id: sceneId});

    if (lightGroup.scenes.find(x => x.id === sceneId)) {
        return false;
    } else {
        lightGroup.scenes.push(scene);
        await Storage.getInstance().LightGroup.save(lightGroup);
    }

    return true;
};

const unlink = async (groupId: number, sceneId: number) => {
    const lightGroup = await Storage.getInstance().LightGroup.findOneBy({id: groupId});
    const scene = await Storage.getInstance().Scene.findOneBy({id: sceneId});

    if (lightGroup.scenes.find(x => x.id === sceneId)) {
        lightGroup.scenes.filter(x => x.id !== scene.id);
        await Storage.getInstance().LightGroup.save(lightGroup);
    } else {
        return false;
    }

    return true;
};

export default {
    get,
    getOne,
    deleteScene,
    create,
    update,
    link,
    unlink
}
