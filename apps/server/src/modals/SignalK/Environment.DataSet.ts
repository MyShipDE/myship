import {BaseDataSet} from "./BaseDataSet";

export class EnvironmentDataSet extends BaseDataSet {
    insideTemperature: number;
    outsideTemperature: number;
    motorRoomTemperature: number;
    motorWaterTemperature: number;
    apparentWindSpeed: number;
    apparentWindAngle: number;
}
