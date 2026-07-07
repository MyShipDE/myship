import express from "express";
import {Storage} from "../DatabaseProvider";
import {ElectricityConsumptionService} from "../services/ElectricityConsumptionService";
import {BridgeIdentifier} from "../services/BridgeService";
import {ElectricityConsumptionStatsService} from "../services/ElectricityConsumptionStatsService";
import validator from "validator";

export class ElectricityConsumptionController {

    async PostSave(req: express.Request, res: express.Response) {
        try {
            await ElectricityConsumptionService.Instance.save();
            return res.status(200).end();
        } catch (e) {
            return res.status(500).end();
        }
    }

    async Get(req: express.Request, res: express.Response) {
        try {
            const items = await Storage.getInstance().ElectricityConsumption.find({
                relations: {
                    bridge: true
                }
            });
            return res.status(200).send(items);
        } catch (e) {
            return res.status(500).end();
        }
    }

    async GetStats(req: express.Request, res: express.Response) {
        try {

            const items = await Storage.getInstance().ElectricityConsumption.find({
                relations: {
                    bridge: true
                }
            });

            const itemsCounter = await Storage.getInstance().ElectricityConsumption.count();

            const bridges = await Storage.getInstance().Bridge.find({
                relations: {
                    type: true
                },
                where: {
                    type: {
                        identifier: BridgeIdentifier.bridge220v1cShelly
                    }
                }
            });

            const lastDay = ElectricityConsumptionStatsService.Instance.getConsumptionForAllBridges(items, 1, bridges);
            const lastWeek = ElectricityConsumptionStatsService.Instance.getConsumptionForAllBridges(items, 7, bridges);
            const lastMonth = ElectricityConsumptionStatsService.Instance.getConsumptionForAllBridges(items, 30, bridges);
            const lastYear = ElectricityConsumptionStatsService.Instance.getConsumptionForAllBridges(items, 365, bridges);

            let custom = 0;
            if (req.params.days != null && validator.isNumeric(req.params.days.toString())) {
                custom = ElectricityConsumptionStatsService.Instance.getConsumptionForAllBridges(items, +req.params.days, bridges);
            }

            return res.status(200).send({
                lastDay, lastWeek, lastMonth, lastYear, custom, itemsCounter
            });
        } catch (e) {
            return res.status(500).end();
        }
    }

}
