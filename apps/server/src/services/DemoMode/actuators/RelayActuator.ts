import {Bridge} from "../../../modals/Bridge";
import {ShellyService} from "../../ShellyService";
import {TasmotaService, TasmotaState} from "../../TasmotaService";
import {Log} from "../../helpers/Log";

/**
 * Abstraction over relay hardware (Shelly / Tasmota). deviceService stays
 * unchanged (it flips device.isActive + emits the socket event itself); only
 * the outbound hardware call is swapped.
 */
export interface RelayActuator {
    shellyControl(bridge: Bridge, isOn: boolean): Promise<boolean>;
    shellyGetState(bridge: Bridge): Promise<boolean>;
    tasmotaControl(bridge: Bridge, port: number, state: boolean): Promise<boolean>;
    tasmotaGetState(bridge: Bridge, port: number): Promise<TasmotaState>;
}

/** Real hardware: delegates to the existing Shelly/Tasmota HTTP services. */
export class RealRelayActuator implements RelayActuator {
    async shellyControl(bridge: Bridge, isOn: boolean): Promise<boolean> {
        return (await ShellyService.control(bridge, isOn)) === true;
    }

    async shellyGetState(bridge: Bridge): Promise<boolean> {
        return (await ShellyService.getState(bridge)) === true;
    }

    tasmotaControl(bridge: Bridge, port: number, state: boolean): Promise<boolean> {
        return TasmotaService.control(bridge, port, state);
    }

    tasmotaGetState(bridge: Bridge, port: number): Promise<TasmotaState> {
        return TasmotaService.getStateOfPort(bridge, port);
    }
}

/** Demo: no hardware I/O; returns success so the caller reflects virtual state. */
export class DemoRelayActuator implements RelayActuator {
    async shellyControl(bridge: Bridge, isOn: boolean): Promise<boolean> {
        Log.debug(`[DEMO] shelly ${bridge.name} -> ${isOn ? 'on' : 'off'}`);
        return true;
    }

    async shellyGetState(bridge: Bridge): Promise<boolean> {
        return false;
    }

    async tasmotaControl(bridge: Bridge, port: number, state: boolean): Promise<boolean> {
        Log.debug(`[DEMO] tasmota ${bridge.name}:${port} -> ${state}`);
        return true;
    }

    async tasmotaGetState(bridge: Bridge, port: number): Promise<TasmotaState> {
        return TasmotaState.Deactivated;
    }
}
