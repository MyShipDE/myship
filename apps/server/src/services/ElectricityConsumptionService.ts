import {Storage} from "../DatabaseProvider";
import {ShellyService} from "./ShellyService";
import {ElectricityConsumption} from "../modals/ElectricityConsumption";

export class ElectricityConsumptionService {

    private static _instance: ElectricityConsumptionService;

    async save() {
        const bridges = await Storage.getInstance().Bridge.find({
            relations: {
                type: true
            }
        });

        const shellyBridges = bridges.filter(x => x.type.identifier === '220v_shelly_oneChannel');

        for (const bridge of shellyBridges) {
            const details = await ShellyService.getSwitchDetails(bridge);
            if (details != null) {
                const electricityConsumption = new ElectricityConsumption();
                electricityConsumption.bridge = bridge;
                electricityConsumption.counter = details.aenergy.total;
                await electricityConsumption.save();
            }
        }
    }

    async saveBridgeValue() {
        const bridges = await Storage.getInstance().Bridge.find({
            relations: {
                type: true
            }
        });
        const shellyBridges = bridges.filter(x => x.type.identifier === '220v_shelly_oneChannel');

        for (const bridge of shellyBridges) {
            if (bridge.totalConsumption != null && bridge.totalConsumption !== 0) {
                const electricityConsumption = new ElectricityConsumption();
                electricityConsumption.bridge = bridge;
                electricityConsumption.counter = bridge.totalConsumption;
                await electricityConsumption.save();
            }
        }
    }

    static get Instance() {
        if (this._instance == null) this._instance = new ElectricityConsumptionService();
        return this._instance;
    }

}
