import express from "express";
import {UpdateService} from "../services/UpdateService";
import {SignalKHelper} from "../services/helpers/SignalKHelper";
import {Storage} from "../DatabaseProvider";
import {SocketIO} from "../services/socket.io/SocketIO";
import {SocketChannel} from "../resources/SocketChannel";

export class TemplateVDRController {

    async GetOneByName(req: express.Request, res: express.Response) {
        if (req.params.name != null) {
            const item = await Storage.getInstance().TemplateVDR.findOneBy({name: req.params.name});
            if (item != null) {
                return res.status(200).send(item);
            }
        }
        res.status(400).end();
    }

    async GetAll(req: express.Request, res: express.Response) {
        const items = await Storage.getInstance().TemplateVDR.find();
        if (items != null) {
            return res.status(200).send(items);
        }
        res.status(400).end();
    }

    async Put(req: express.Request, res: express.Response) {
        if (req.body != null && req.body.id != null) {
            const item = await Storage.getInstance().TemplateVDR.findOneBy({id: +req.body.id});
            if (item != null) {

                if (req.body?.active !== item.active) {
                    const templates = await Storage.getInstance().TemplateVDR.find();
                    const activeTemplates = templates.filter(x => x.active = true);
                    for (const x of activeTemplates) {
                        x.active = false;
                        await x.save();
                    }
                }

                item.loggingInterval = req.body?.loggingInterval;
                item.radiusOfMovement = req.body?.radiusOfMovement;
                item.idleTime = req.body?.idleTime;
                item.reminderInterval = req.body?.reminderInterval;
                item.allowedCourseChange = req.body?.allowedCourseChange;
                item.active = req.body?.active;

                await item.save();

                SocketIO.emit(SocketChannel.VdrSettingsManagedNotification, null);
                return res.status(200).end();
            }
        }
        res.status(400).end();
    }

}
