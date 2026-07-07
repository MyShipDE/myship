import {BaseDataSet} from "./BaseDataSet";

export class BatteryDataSet extends BaseDataSet {
    lifeTimeDischarge: number;
    voltage: number;
    current: number;
    capacityConsumedCharge: number;
    stateOfCharge: number;
    timeRemaining: number;
    frequencyTerminalW: number;
}
