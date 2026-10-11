import {DemoMode} from "../DemoMode";
import {Log} from "../../helpers/Log";
import {DemoLightActuator, LightActuator, RealLightActuator} from "./LightActuator";
import {DemoRelayActuator, RealRelayActuator, RelayActuator} from "./RelayActuator";

/**
 * Dependency-injection point for hardware actuators. Real vs. demo
 * implementations are chosen once (by DEMO_MODE) and consumed app-wide via
 * `Actuators.light` / `Actuators.relay`.
 */
export class Actuators {
    private static _light: LightActuator;
    private static _relay: RelayActuator;

    static init(): void {
        if (DemoMode.active) {
            Log.info('[DEMO] Actuators in demo mode — no real hardware will be controlled.');
            Actuators._light = new DemoLightActuator();
            Actuators._relay = new DemoRelayActuator();
        } else {
            Actuators._light = new RealLightActuator();
            Actuators._relay = new RealRelayActuator();
        }
    }

    static get light(): LightActuator {
        if (Actuators._light == null) Actuators.init();
        return Actuators._light;
    }

    static get relay(): RelayActuator {
        if (Actuators._relay == null) Actuators.init();
        return Actuators._relay;
    }
}
