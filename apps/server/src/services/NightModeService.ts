import {Storage} from "../DatabaseProvider";
import controlLightService from "./controlLightService";
import {TasmotaService} from "./TasmotaService";
import {SocketIO} from "./socket.io/SocketIO";
import {SocketChannel} from "../resources/SocketChannel";
import {SettingsService} from "./SettingsService";
import {DataRegistryName} from "../resources/RegistryProperties";

export class NightModeService {

    private static _instance: NightModeService;

    async enable() {

        await SettingsService.Instance.pull();

        const lights = await Storage.getInstance().Light.find();
        const nightMode = SettingsService.Instance.findProperty(DataRegistryName.NightModeState);

        if (lights != null && lights.length > 0) {
            for (const light of lights) {
                if (light.isActive) {
                    await controlLightService(light.host, 255, 0, 0, 120);
                }
            }
        }

        const devices = await Storage.getInstance().Device.find({
            relations: {
                bridge: true
            },
            where: {type: 'light'}
        });

        if (devices.length != null) {
            for (const device of devices) {
                if (device.bridge == null) continue;
                const bridge = await Storage.getInstance().Bridge.findOneBy({id: device.bridge.id});
                if (device.isActive && bridge != null) {
                    await TasmotaService.control(bridge, device.bridgePort, false);
                    device.isActive = false;
                }
            }
        }

        nightMode.value = true;
        await SettingsService.Instance.push();
        SocketIO.emit(SocketChannel.NightModeStateManagedObject, true);
    }

    async disable() {

        await SettingsService.Instance.pull();

        const lights = await Storage.getInstance().Light.find();
        const nightMode = SettingsService.Instance.findProperty(DataRegistryName.NightModeState);

        if (lights.length != null) {
            for (const light of lights) {
                if (light.isActive && light.R != null && light.G != null && light.B != null) {
                    await controlLightService(light.host, light.R, light.G, light.B, light.BRI);
                    light.isActive = false;
                }
            }
        }

        nightMode.value = false;
        await SettingsService.Instance.push();
        SocketIO.emit(SocketChannel.NightModeStateManagedObject, false);
    }

    static getInstance(): NightModeService {
        if (!NightModeService._instance) {
            NightModeService._instance = new NightModeService();
        }
        return NightModeService._instance;
    }

}
