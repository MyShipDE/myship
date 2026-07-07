import lightService from '../services/lightService';
import express from "express";
import {SocketIO} from "../services/socket.io/SocketIO";
import {SocketChannel} from "../resources/SocketChannel";

export class LightController {

    async getAll(req: express.Request, res: express.Response) {
        const lights = await lightService.getAll();
        res.status(200).send(lights);
    }

    async get(req: express.Request, res: express.Response) {
        if (req.params.id !== undefined) {
            const light = await lightService.get(+req.params.id);
            res.status(200).send(light);
            return;
        }
        res.status(400).end();
    }

    async create(req: express.Request, res: express.Response) {
        if (
            req.body.name != null &&
            req.body.control_ard_id != null &&
            req.body.control_ard_port != null
        ) {
            const query = await lightService.create(
                req.body.name,
                req.body.control_ard_id,
                req.body.control_ard_port
            )
            if (query !== false) {
                SocketIO.emit(SocketChannel.LightManagedNotification, null);
                res.status(200).end();
                return;
            }
        }
        res.status(400).end();
    }

    async update(req: express.Request, res: express.Response) {
        if (
            req.body.id != null &&
            req.body.name != null &&
            req.body.control_ard_id != null &&
            req.body.control_ard_port != null &&
            req.body.monitor_ard_id != null &&
            req.body.monitor_ard_port != null &&
            req.body.vPa != null &&
            req.body.nullPoint != null
        ) {
            const query = await lightService.update(
                req.body.id,
                req.body.name,
                req.body.control_ard_id,
                req.body.control_ard_port
            )
            if (query !== false) {
                SocketIO.emit(SocketChannel.LightManagedNotification, null);
                res.status(200).end();
                return;
            }
        }
        res.status(400).end();
    }

    async remove(req: express.Request, res: express.Response) {
        if (
            req.params.id != null
        ) {
            const query = await lightService.remove(
                +req.params.id
            )
            if (query !== false) {
                SocketIO.emit(SocketChannel.LightManagedNotification, null);
                res.status(200).end();
                return;
            }
        }
        res.status(400).end();
    }

    async control(req: express.Request, res: express.Response) {
        if (req.body.light_id != null) {
            if (
                req.body.r != null &&
                req.body.g != null &&
                req.body.b != null &&
                req.body.brightness != null
            ) {
                let sceneId = 0;
                if (req.body.scene_id != null) {
                    sceneId = req.body.scene_id;
                }
                if (
                    await lightService.control(
                        req.body.light_id,
                        req.body.r,
                        req.body.g,
                        req.body.b,
                        req.body.brightness
                    )
                ) {
                    res.status(200).end();
                    return;
                }
            } else {
                res.status(400).end("Metadata not requested.");
                return;
            }
        } else {
            res.status(400).end("Light ID not requested.");
            return;
        }
        res.status(500).end();
    }

    async getNightMode(req: express.Request, res: express.Response) {
        const status = await lightService.getNightMode();
        if (status != null) res.status(200).send(status);
        res.status(500).end();
    }

    async setNightMode(req: express.Request, res: express.Response) {
        if (req.body.status != null) {
            if (req.body.status) {
                await lightService.enableNightMode();
                res.status(200).end();
            } else {
                await lightService.disableNightMode();
                res.status(200).end();
            }
        } else {
            res.status(400).end("Body is corrupt.");
        }
    }
}
