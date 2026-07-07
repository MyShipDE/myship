export class ShellySwitchDetails {
    id: number;
    source: string;
    output: boolean;
    apower: number;
    voltage: number;
    current: number;
    aenergy: ShellyAEnergy;
    minute_ts: number;
    temperature: ShellyTemperature
}

export interface ShellyAEnergy {
    total: number;
    by_minute: number[];
}

export interface ShellyTemperature {
    tC: number;
    tF: number;
}
