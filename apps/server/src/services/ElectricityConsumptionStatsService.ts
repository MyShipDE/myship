import {Storage} from "../DatabaseProvider";
import {ShellyService} from "./ShellyService";
import {ElectricityConsumption} from "../modals/ElectricityConsumption";
import {Bridge} from "../modals/Bridge";

export class ElectricityConsumptionStatsService {

    private static _instance: ElectricityConsumptionStatsService;

    getLastDaysConsumption(data: ElectricityConsumption[], days: number, bridge: Bridge): number {
        const now = new Date();
        const daysBefore = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        const filteredData = data
            .filter((record) => new Date(record.createdAt) >= daysBefore)
            .filter((record) => record.bridge.id === bridge.id)
            .sort((a, b) => a.id - b.id);

        const consumptions: number[] = [];
        let lastConsumption = 0;
        let previousRecord = 0;

        for (const record of filteredData) {

            if (record.counter > previousRecord) {
                lastConsumption += record.counter - previousRecord;
                previousRecord = record.counter;
            } else {
                consumptions.push(lastConsumption);
                lastConsumption = 0;
                previousRecord = record.counter;
            }

        }

        if (lastConsumption > 0) {
            consumptions.push(lastConsumption);
        }

        let totalConsumption = 0;
        for (const consumptionOutput of consumptions) {
            totalConsumption += consumptionOutput;
        }

        return totalConsumption;
    }

    getConsumptionForAllBridges(data: ElectricityConsumption[], days: number, bridges: Bridge[]): number {
        let totalConsumption = 0;
        for (const bridge of bridges) {
            totalConsumption += this.getLastDaysConsumption(data, days, bridge);
        }
        return totalConsumption;
    }

    static get Instance() {
        if (this._instance == null) this._instance = new ElectricityConsumptionStatsService();
        return this._instance;
    }

}
