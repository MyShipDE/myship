import {Storage} from "../../DatabaseProvider";
import {BridgeIdentifier, BridgeService} from "../BridgeService";
import {BridgeType} from "../../modals/BridgeType";
import {Bridge} from "../../modals/Bridge";
import {Device} from "../../modals/Device";
import {Light} from "../../modals/Light";
import {LightGroup} from "../../modals/LightGroup";
import {Scene} from "../../modals/Scene";
import {BatteryLog} from "../../modals/BatteryLog";
import {Setup} from "../../modals/Setup";
import {SignalKDatasource} from "../../modals/SignalKDatasource";
import {Alarm} from "../../modals/Alarm";
import {Log} from "../helpers/Log";

/**
 * Seeds a realistic virtual fleet so the whole REST/UI works in demo mode.
 * Idempotent: only runs when the database is empty. Shelly consumers get
 * topic-friendly bridge names so DemoSimulator can publish their MQTT status.
 */
export class DemoSeeder {
    static async seed(): Promise<void> {
        const storage = Storage.getInstance();

        if ((await storage.Bridge.count()) > 0) {
            Log.info('[DEMO] Seed skipped — data already present.');
            return;
        }

        Log.info('[DEMO] Seeding virtual fleet …');

        const bs = BridgeService.getInstance();
        await bs.ensureExists(BridgeIdentifier.bridge12v4cSon, 'FourChannel - Relay - DC - Sonoff');
        await bs.ensureExists(BridgeIdentifier.bridge220v1cShelly, 'OneChannel - Relay - AC - Shelly');
        await bs.ensureExists(BridgeIdentifier.bridgeNeoPixelMultiple, 'LED-Controller (Multiple NeoPixels)');

        const shellyType = await storage.BridgeType.findOneBy({identifier: BridgeIdentifier.bridge220v1cShelly});
        const tasmotaType = await storage.BridgeType.findOneBy({identifier: BridgeIdentifier.bridge12v4cSon});
        if (shellyType == null || tasmotaType == null) {
            Log.error('[DEMO] Bridge types missing — aborting seed.');
            return;
        }

        // Shelly consumers — bridge.name is also the MQTT topic prefix
        // (<name>/status/switch:0) the battery page subscribes to.
        const shellyConsumers = [
            {bridge: 'ladegeraet', device: 'Ladegerät'},
            {bridge: 'steckdosen', device: 'Steckdosen'},
            {bridge: 'herd', device: 'Herd'},
        ];
        let ip = 30;
        for (const c of shellyConsumers) {
            const bridge = await this.createBridge(c.bridge, shellyType, `10.0.0.${ip++}`);
            await this.createDevice(c.device, 'ver', bridge, null);
        }

        // Tasmota 12V 4-channel: position/navigation lights + a consumer.
        const navBridge = await this.createBridge('Navigationslichter', tasmotaType, `10.0.0.${ip++}`);
        await this.createDevice('Fahrtlicht', 'pos', navBridge, 1);
        await this.createDevice('Motorlicht', 'pos', navBridge, 2);
        await this.createDevice('Ankerlicht', 'pos', navBridge, 3);
        await this.createDevice('Decksbeleuchtung', 'ver', navBridge, 4);

        // NeoPixel lights (addressed by host) + a group with scenes.
        const salon1 = await this.createLight('Salon vorn', `10.0.0.${ip++}`);
        const salon2 = await this.createLight('Salon achtern', `10.0.0.${ip++}`);
        const cabin = await this.createLight('Bugkabine', `10.0.0.${ip++}`);

        const warm = await this.createScene('Warmweiß', 255, 180, 80, 255);
        const night = await this.createScene('Nachtfahrt (rot)', 255, 0, 0, 120);
        const bright = await this.createScene('Hell', 255, 255, 255, 255);

        const salonGroup = new LightGroup();
        salonGroup.name = 'Salon';
        salonGroup.lights = [salon1, salon2];
        salonGroup.scenes = [warm, night, bright];
        await salonGroup.save();

        const cabinGroup = new LightGroup();
        cabinGroup.name = 'Kabine';
        cabinGroup.lights = [cabin];
        cabinGroup.scenes = [warm, night];
        await cabinGroup.save();

        // Battery history
        const now = Date.now();
        for (let i = 0; i < 24; i++) {
            const log = new BatteryLog();
            log.voltage = 12.6 + Math.sin(i / 3) * 0.3;
            log.current = -8 + Math.cos(i / 4) * 4;
            log.state = 80 + Math.sin(i / 5) * 15;
            log.remaining = 180 + i;
            await log.save();
        }

        // One active demo alarm on the main battery voltage.
        const source = new SignalKDatasource();
        source.name = 'Hauptbatterie Spannung';
        source.path = 'electrical.batteries.main.voltage';
        source.unit = 'V';
        await source.save();

        const alarm = new Alarm();
        alarm.name = 'Unterspannung Hauptbatterie';
        alarm.interval = 60;
        alarm.minValue = 11.8;
        alarm.maxValue = 14.6;
        alarm.active = true;
        alarm.showInApp = true;
        alarm.signalKDatasource = source;
        await alarm.save();

        const shipName = new Setup();
        shipName.name = 'demo.ship.name';
        shipName.stringValue = 'Demo Vessel';
        await shipName.save();

        Log.info('[DEMO] Virtual fleet seeded.');
    }

    private static async createBridge(name: string, type: BridgeType, ip: string): Promise<Bridge> {
        const bridge = new Bridge();
        bridge.name = name;
        bridge.ip = ip;
        bridge.type = type;
        await bridge.save();
        return bridge;
    }

    private static async createDevice(name: string, type: string, bridge: Bridge, port: number | null): Promise<Device> {
        const device = new Device();
        device.name = name;
        device.type = type;
        device.bridge = bridge;
        device.bridgePort = port;
        device.isActive = false;
        device.identifier = 'demo-' + name.toLowerCase().replace(/\s+/g, '-');
        await device.save();
        return device;
    }

    private static async createLight(name: string, host: string): Promise<Light> {
        const light = new Light();
        light.name = name;
        light.host = host;
        light.isActive = false;
        light.R = 255;
        light.G = 180;
        light.B = 80;
        light.BRI = 255;
        await light.save();
        return light;
    }

    private static async createScene(name: string, r: number, g: number, b: number, bri: number): Promise<Scene> {
        const scene = new Scene();
        scene.name = name;
        scene.R = r;
        scene.G = g;
        scene.B = b;
        scene.BRI = bri;
        await scene.save();
        return scene;
    }
}
