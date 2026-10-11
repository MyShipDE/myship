import {Log} from "../helpers/Log";
import {Actuators} from "./actuators/Actuators";
import {DemoSeeder} from "./DemoSeeder";
import {DemoSignalKServer} from "./DemoSignalKServer";
import {DemoSimulator} from "./DemoSimulator";

/**
 * Orchestrates the demo mode: selects demo actuators, seeds a virtual fleet,
 * serves a simulated SignalK stream and drives live value changes. Invoked from
 * bootstrap when DEMO_MODE=true.
 */
export class DemoModeService {
    private static _instance: DemoModeService;

    static get Instance(): DemoModeService {
        if (this._instance == null) this._instance = new DemoModeService();
        return this._instance;
    }

    async initialize(): Promise<void> {
        Log.info('[DEMO] Demo mode active — simulating a virtual vessel, no real hardware.');

        // 1) demo actuators (no hardware I/O)
        Actuators.init();

        // 2) seed a virtual fleet into the (empty) database
        await DemoSeeder.seed();

        // 3) serve a simulated SignalK stream on SIGNALK_PORT so the whole
        //    existing pipeline + the client's direct stream work unchanged
        DemoSignalKServer.Instance.start();

        // 4) drive live value changes + publish Shelly status to the MQTT broker
        DemoSimulator.Instance.start();
    }
}
