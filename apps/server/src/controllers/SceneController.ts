import sceneService from '../services/sceneService';
import express from "express";
import {Storage} from "../DatabaseProvider";
import {SocketIO} from "../services/socket.io/SocketIO";
import {SocketChannel} from "../resources/SocketChannel";

export class SceneController {

    async getAll(req: express.Request, res: express.Response) {
        try {
            const scenes = await Storage.getInstance().Scene.find();
            res.status(200).send(scenes);
        } catch (e) {
            res.status(500).end();
        }
    }

    async getAllByGroup(req: express.Request, res: express.Response) {
        if (req.params.id != null) {
            try {
                const scenes = await Storage.getInstance().Scene.findBy({id: +req.params.id});
                res.status(200).send(scenes);
            } catch (e) {
                res.status(500).end();
            }
        } else {
            res.status(400).end();
        }
    }

    async getOne(req: express.Request, res: express.Response) {
        if (req.params.id != null) {
            const scene = await sceneService.getOne(+req.params.id);

            if (scene == null) {
                return res.status(404).end();
            }

            res.status(200).send(scene);
            return;
        }
        res.status(500).end();
    };

    async deleteScene(req: express.Request, res: express.Response) {
        if (req.params.id != null) {
            if (await sceneService.deleteScene(+req.params.id)) {
                SocketIO.emit(SocketChannel.SceneManagedNotification, null);
                res.status(200).end();
                return;
            }
            res.status(400).end();
            return;
        }
        res.status(500).end();
    }

    async create(req: express.Request, res: express.Response) {
        const query = await sceneService.create(req.body);
        if (query !== false) {
            SocketIO.emit(SocketChannel.SceneManagedNotification, null);
            res.status(200).send(query);
            return;
        }
        res.status(500).end();
    }

    async update(req: express.Request, res: express.Response) {
        const query = await sceneService.update(req.body);
        if (query !== false) {
            SocketIO.emit(SocketChannel.SceneManagedNotification, null);
            res.status(200).end();
            return;
        }
        res.status(500).end();
    }

    async link(req: express.Request, res: express.Response) {
        if (req.body.group_id != null && req.body.scene_id != null) {
            if (await sceneService.link(req.body.group_id, req.body.scene_id)) {
                SocketIO.emit(SocketChannel.SceneManagedNotification, null);
                res.status(200).end();
                return;
            } else {
                res.status(500).end();
                return;
            }
        }
        res.status(400).end();
    }

    async unlink(req: express.Request, res: express.Response) {
        if (req.body.group_id != null && req.body.scene_id != null) {
            if (await sceneService.unlink(req.body.group_id, req.body.scene_id)) {
                SocketIO.emit(SocketChannel.SceneManagedNotification, null);
                res.status(200).end();
                return;
            } else {
                res.status(500).end();
                return;
            }
        }
        res.status(400).end();
    }

}
