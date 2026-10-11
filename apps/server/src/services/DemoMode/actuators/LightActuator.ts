import controlLightService from "../../controlLightService";
import {Log} from "../../helpers/Log";

/**
 * Abstraction over the physical LED/light output. The caller (lightService /
 * lightGroupService) stays unchanged and still updates DB state + emits socket
 * events; only the hardware I/O is swapped here.
 */
export interface LightActuator {
    control(host: string, r: number, g: number, b: number, brightness: number, length?: number): Promise<boolean>;
}

/** Real hardware: delegates to the existing LED HTTP control. */
export class RealLightActuator implements LightActuator {
    control(host: string, r: number, g: number, b: number, brightness: number, length: number = 300): Promise<boolean> {
        return controlLightService(host, r, g, b, brightness, length);
    }
}

/** Demo: no hardware I/O; the caller still reflects the virtual state. */
export class DemoLightActuator implements LightActuator {
    async control(host: string, r: number, g: number, b: number, brightness: number, length: number = 300): Promise<boolean> {
        Log.debug(`[DEMO] light ${host} -> rgb(${r},${g},${b}) bri ${brightness} len ${length}`);
        return true;
    }
}
