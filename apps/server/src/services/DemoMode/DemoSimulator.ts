import mqtt from "mqtt";
import {Storage} from "../../DatabaseProvider";
import {BridgeIdentifier} from "../BridgeService";
import {Log} from "../helpers/Log";
import {DemoSignalKServer, SignalKValue} from "./DemoSignalKServer";

/**
 * Drives live demo data: advances a virtual voyage + battery/wind/engine values
 * (pushed through {@link DemoSignalKServer}) and publishes Shelly-style status
 * to the local MQTT broker so the client's MQTT battery path is live too.
 */
export class DemoSimulator {
    private static _instance: DemoSimulator;

    static get Instance(): DemoSimulator {
        if (this._instance == null) this._instance = new DemoSimulator();
        return this._instance;
    }

    private signalKTimer: NodeJS.Timeout | null = null;
    private mqttTimer: NodeJS.Timeout | null = null;
    private mqttClient: any = null;

    // Virtual vessel state (start off Kiel).
    private t = 0;
    private lat = 54.32;
    private lon = 10.14;
    private cog = 1.2;   // radians
    private sog = 3.0;   // m/s
    private soc = 0.85;  // 0..1

    start(): void {
        this.signalKTimer = setInterval(() => this.tickSignalK(), 1000);
        this.connectMqtt();
        Log.info('[DEMO] Simulator started.');
    }

    private tickSignalK(): void {
        this.t += 1;

        // Advance position ~1s along the current course; let the course wander.
        const earthRadius = 6371000;
        this.cog += Math.sin(this.t / 30) * 0.002;
        const dLat = (this.sog * Math.cos(this.cog)) / earthRadius;
        const dLon = (this.sog * Math.sin(this.cog)) / (earthRadius * Math.cos(this.lat * Math.PI / 180));
        this.lat += dLat * 180 / Math.PI;
        this.lon += dLon * 180 / Math.PI;

        const voltage = 12.6 + Math.sin(this.t / 60) * 0.25;
        const current = -8 + Math.cos(this.t / 50) * 5;
        this.soc = Math.max(0.3, Math.min(1, this.soc + (current < 0 ? -0.00002 : 0.00003)));

        const values: SignalKValue[] = [
            {path: 'navigation.position', value: {latitude: this.lat, longitude: this.lon}},
            {path: 'navigation.speedOverGround', value: +this.sog.toFixed(2)},
            {path: 'navigation.courseOverGroundTrue', value: +this.normalize(this.cog).toFixed(4)},
            {path: 'navigation.headingMagnetic', value: +this.normalize(this.cog).toFixed(4)},
            {path: 'electrical.batteries.main.voltage', value: +voltage.toFixed(2)},
            {path: 'electrical.batteries.main.current', value: +current.toFixed(2)},
            {path: 'electrical.batteries.main.capacity.stateOfCharge', value: +this.soc.toFixed(3)},
            {path: 'electrical.batteries.starter.voltage', value: +(12.5 + Math.sin(this.t / 70) * 0.2).toFixed(2)},
            {path: 'electrical.alternators.0.revolutions', value: Math.round(850 + Math.sin(this.t / 10) * 120)},
            {path: 'environment.wind.speedApparent', value: +(6 + Math.sin(this.t / 20) * 2).toFixed(2)},
            {path: 'environment.wind.angleApparent', value: +(Math.sin(this.t / 40) * 0.8).toFixed(3)},
            {path: 'environment.outside.temperature', value: +(291 + Math.sin(this.t / 120) * 3).toFixed(2)},
            {path: 'environment.depth.belowKeel', value: +(8 + Math.sin(this.t / 15) * 2).toFixed(2)},
        ];

        DemoSignalKServer.Instance.publish(values);
    }

    private normalize(radians: number): number {
        let r = radians % (2 * Math.PI);
        if (r < 0) r += 2 * Math.PI;
        return r;
    }

    private connectMqtt(): void {
        const port = +process.env.MQTT_PORT || 1883;
        try {
            this.mqttClient = mqtt.connect(`mqtt://127.0.0.1:${port}`);
            this.mqttClient.on('connect', () => {
                Log.info('[DEMO] Simulator connected to MQTT broker.');
                if (this.mqttTimer == null) {
                    this.mqttTimer = setInterval(() => this.publishShellyStatus(), 3000);
                }
            });
            this.mqttClient.on('error', (e: Error) => Log.error('[DEMO] Simulator MQTT error: ' + e.message));
        } catch (e) {
            Log.error('[DEMO] Simulator could not connect to MQTT: ' + e);
        }
    }

    private async publishShellyStatus(): Promise<void> {
        try {
            const bridges = await Storage.getInstance().Bridge.find({
                relations: {type: true, devices: true},
            });
            for (const bridge of bridges) {
                if (bridge.type == null || bridge.type.identifier !== BridgeIdentifier.bridge220v1cShelly) {
                    continue;
                }
                const device = bridge.devices != null ? bridge.devices[0] : null;
                const on = device != null && device.isActive === true;
                const payload = {
                    output: on,
                    current: on ? +(1 + Math.random() * 3).toFixed(2) : 0,
                    voltage: +(228 + Math.random() * 4).toFixed(1),
                    apower: on ? +(50 + Math.random() * 200).toFixed(1) : 0,
                    aenergy: {total: +(100 + this.t / 10).toFixed(2)},
                };
                this.mqttClient.publish(`${bridge.name}/status/switch:0`, JSON.stringify(payload));
            }
        } catch (e) {
            // ignore transient DB/broker hiccups
        }
    }
}
