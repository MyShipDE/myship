import express from "express";
import {UpdateService} from "../services/UpdateService";
import {SignalKHelper} from "../services/helpers/SignalKHelper";
import {Storage} from "../DatabaseProvider";
import {BluetoothService} from "../services/BluetoothService";
import {SocketIO} from "../services/socket.io/SocketIO";
import {SocketChannel} from "../resources/SocketChannel";

export class SettingsController {
    async Get(req: express.Request, res: express.Response) {
        if (req.params.token != null) {
            const item = await Storage.getInstance().Setup.findOneBy({name: req.params.token});
            if (item != null) {
                res.status(200).send(item);
                return;
            }
        }
        res.status(400).end();
    }

    async PostNumber(req: express.Request, res: express.Response) {
        if (req.body.token != null && req.body.value != null) {
            const item = await Storage.getInstance().Setup.findOneBy({name: req.params.token});
            if (item != null) {
                item.numericValue = +req.body.value;
                await item.save();
                SocketIO.emit(SocketChannel.SettingsManagedNotification, null);
                return res.status(200).end();
            }
        }
        res.status(400).end();
    }

    async PostString(req: express.Request, res: express.Response) {
        if (req.body.token != null && req.body.value != null) {
            const item = await Storage.getInstance().Setup.findOneBy({name: req.params.token});
            if (item != null) {
                item.stringValue = req.body.value;
                await item.save();
                SocketIO.emit(SocketChannel.SettingsManagedNotification, null);
                return res.status(200).end();
            }
        }
        res.status(400).end();
    }

    async Update(req: express.Request, res: express.Response) {
        new UpdateService().updateServer();
        res.status(200).end();
    }

    async PostRestartSignalK(req: express.Request, res: express.Response) {
        await SignalKHelper.getInstance().restart();
        res.status(200).end();
    }

    async enableBluetoothDiscovery(req: express.Request, res: express.Response) {
        /* res.status(200).send({
            state: (await BluetoothService.getInstance().enableDiscovery())
        }); */
    }

    async disableBluetoothDiscovery(req: express.Request, res: express.Response) {
        /* res.status(200).send({
            state: (await BluetoothService.getInstance().disableDiscovery())
        }); */
    }

}
