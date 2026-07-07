import express from "express";
import {EngineHourMeterService} from "../services/EngineHourMeterService";

export class EngineLogController {

    async GetEngineHours(req: express.Request, res: express.Response) {
        try {
            const seconds = await EngineHourMeterService.getInstance().getSeconds();
            return res.status(200).send({
                durationInSeconds: seconds
            });
        } catch (e) {
            return res.status(500).end();
        }
    }

    async GetEngineHoursByDay(req: express.Request, res: express.Response) {
        try {
            const seconds = await EngineHourMeterService.getInstance().getSecondsByDay();
            return res.status(200).send({
                durationInSeconds: seconds
            });
        } catch (e) {
            return res.status(500).end();
        }
    }

}
