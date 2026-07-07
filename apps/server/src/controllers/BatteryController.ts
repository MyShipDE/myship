import express from "express";
import {Storage} from "../DatabaseProvider";

export class BatteryController {

    async GetAll(req: express.Request, res: express.Response) {
        const logs = await Storage.getInstance().BatteryLog.find();
        res.status(200).send(logs);
        return;
    }

}
