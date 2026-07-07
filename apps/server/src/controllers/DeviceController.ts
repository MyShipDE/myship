import express from "express";
import {Storage} from "../DatabaseProvider";
import {Device} from "../modals/Device";
import {String} from "../services/helpers/String";
import {SocketIO} from "../services/socket.io/SocketIO";
import {SocketChannel} from "../resources/SocketChannel";
import {DeviceService} from "../services/deviceService";

export class DeviceController {

    async get(req: express.Request, res: express.Response) {
        const devices = await DeviceService.get();
        res.status(200).send(devices);
    }

    async getStatus(req: express.Request, res: express.Response) {
        let status = "0";
        if (req.params.id != null) {
            const device = await Storage.getInstance().Device.findOneBy({id: +req.params.id});
            if (device != null) {
                if (device.isActive)
                    status = "1";
                res.status(200).send(status);
                return;
            }
            res.status(200).send(status);
            return;
        }
        res.status(400).end();
    }

    async getOne(req: express.Request, res: express.Response) {
        if (req.params.id != null) {
            const device = await DeviceService.getOne(+req.params.id);
            res.status(200).send(device);
            return;
        }
        res.status(500).end();
    }

    async control(req: express.Request, res: express.Response) {
        if (req.body.device_id != null) {
            if (await DeviceService.control(req.body.device_id)) {
                res.status(200).end();
                return;
            }
            res.status(500).end();
            return;
        }
        res.status(400).end();
    }

    async Put(req: express.Request, res: express.Response) {

        if (req.body == null) {
            return res.status(400).end();
        }

        const device: Device = Object.assign(new Device(), req.body);

        if (device.identifier == null) {
            device.identifier = String.generate(16);
        }

        SocketIO.emit(SocketChannel.DeviceManagedNotification, null);
        await device.save();
        return res.status(200).end();

    }

    async Delete(req: express.Request, res: express.Response) {
        try {
            if (req.params.id == null) {
                return res.status(400).end();
            }

            const device = await Storage.getInstance().Device.findOneBy({id: +req.params.id});

            await device.remove();

            SocketIO.emit(SocketChannel.DeviceManagedNotification, null);
            return res.status(200).end();
        } catch (e) {
            return res.status(500).end();
        }
    }

    async GetBridges(req: express.Request, res: express.Response) {
        try {
            const bridges = await Storage.getInstance().Bridge.find({
                relations: {
                    type: true
                }
            });
            return res.status(200).send(bridges);
        } catch (e) {
            return res.status(500).end();
        }
    }

}
