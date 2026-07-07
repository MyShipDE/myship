import lightGroupService from '../services/lightGroupService';
import express from "express";
import {Storage} from "../DatabaseProvider";
import {LightGroup} from "../modals/LightGroup";
import {Light} from "../modals/Light";
import {Log} from "../services/helpers/Log";
import {Scene} from "../modals/Scene";
import {SocketIO} from "../services/socket.io/SocketIO";
import {SocketChannel} from "../resources/SocketChannel";

export class LightGroupController {

    async getAll(req: express.Request, res: express.Response) {
        try {
            const groups = await Storage.getInstance().LightGroup.find({
                relations: {
                    lights: true,
                    scenes: true
                }
            });
            res.status(200).send(groups);
        } catch (e) {
            res.status(500).end();
        }
    }

    async getOne(req: express.Request, res: express.Response) {
        if (req.params.id != null) {
            try {
                const group = await Storage.getInstance().LightGroup.findOne({
                    relations: {
                        lights: true,
                        scenes: true
                    },
                    where: {
                        id: +req.params.id
                    }
                });
                res.status(200).send(group);
            } catch (e) {
                res.status(500).end();
            }
        } else {
            res.status(400).end();
        }
    }

    async update(req: express.Request, res: express.Response) {
        if (req.body != null) {
            try {
                const group: LightGroup = Object.assign(new LightGroup(), req.body);

                const lights: Light[] = [];
                const scenes: Scene[] = [];

                for (const lightObj of group.lights) {
                    const light: Light = Object.assign(new Light(), lightObj);
                    lights.push(light);
                    await Storage.getInstance().Light.save(light);
                }

                for (const sceneObj of group.scenes) {
                    const scene: Scene = Object.assign(new Scene(), sceneObj);
                    scenes.push(scene);
                    await Storage.getInstance().Scene.save(scene);
                }

                group.lights = lights;
                group.scenes = scenes;

                await Storage.getInstance().LightGroup.save(group);

                SocketIO.emit(SocketChannel.LightGroupManagedNotification, null);
                res.status(200).end();
            } catch (e) {
                Log.error(e);
                res.status(500).end();
            }
        } else {
            res.status(400).end();
        }
    }

    async delete(req: express.Request, res: express.Response) {
        if (req.params.id != null) {
            try {
                const group = await Storage.getInstance().LightGroup.findOneBy({id: +req.params.id});

                if (group == null) {
                    return res.status(404).end();
                }

                await group.remove();

                SocketIO.emit(SocketChannel.LightGroupManagedNotification, null);
                res.status(200).end();
            } catch (e) {
                res.status(500).end();
            }
        } else {
            res.status(400).end();
        }
    }

    async control(req: express.Request, res: express.Response) {
        if (req.body.group_id != null) {
            let query = false;
            if (req.body.scene_id != null) {
                query = await lightGroupService.selectScene(req.body.group_id, req.body.scene_id);
            } else if (req.body.r != null && req.body.g != null && req.body.b != null && req.body.brightness != null) {
                query = await lightGroupService.control(req.body.group_id, req.body.r, req.body.g, req.body.b, req.body.brightness);
            } else {
                res.status(400).end("Scene ID or RGB-Values is required!");
                return;
            }
            if (query) {
                res.status(200).end();
                return;
            }
        } else {
            res.status(400).end("Group ID is required!");
            return;
        }
        res.status(500).end();
    }

}
