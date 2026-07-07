import {BaseDataSet} from "./BaseDataSet";

export class NavigationDataSet extends BaseDataSet {
    courseOverGroundMagnetic: number;
    courseOverGroundTrue: number;
    datetime: string;
    antennaAltitude: number;
    differentialAge: number;
    differentialReference: number;
    horizontalDilution: number;
    satellites: number;
    longitude: number;
    latitude: number;
    speedOverGround: number;
    high: number;
}
