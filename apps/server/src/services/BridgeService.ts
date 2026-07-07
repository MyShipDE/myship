import {Setup} from "../modals/Setup";
import {Storage} from "../DatabaseProvider";
import {BridgeType} from "../modals/BridgeType";
import {ShellyService} from "./ShellyService";
import {Log} from "./helpers/Log";

export class BridgeService {

    private static _instance: BridgeService;

    async boot() {
        await this.ensureExists(BridgeIdentifier.bridge12v4cSon, 'FourChannel - Relay - DC - Sonoff');
        await this.ensureExists(BridgeIdentifier.bridge220v1cSon, 'OneChannel - Relay - AC - Sonoff');
        await this.ensureExists(BridgeIdentifier.bridge220v1cShelly, 'OneChannel - Relay - AC - Shelly');
        await this.ensureExists(BridgeIdentifier.bridgeNeoPixelMultiple, 'LED-Controller (Multiple NeoPixels)');
        await this.ensureExists(BridgeIdentifier.bridgeNeoPixelSingle, 'LED-Controller (Single NeoPixels)');

        const bridgeType = await Storage.getInstance().BridgeType.findOne({
            relations: {
                bridges: {
                    devices: true,
                    type: true
                }
            },
            where: {
                identifier: BridgeIdentifier.bridge220v1cShelly
            }
        });

        for (const bridge of bridgeType.bridges) {
            Log.info(`Bridge ${bridge.name} wird initialisiert.`);
            await ShellyService.listenForStateChanges(bridge);

            const state = await ShellyService.getState(bridge);
            for (const device of bridge.devices) {
                device.isActive = state;
                await device.save();
            }
        }

    }

    async ensureExists(identifier: string, description: string) {
        let item: BridgeType = await Storage.getInstance().BridgeType.findOneBy({identifier});
        if (item == null) {
            item = new BridgeType();
            item.identifier = identifier;
            item.description = description;
            await item.save();
        }
    }

    static getInstance() {
        if (this._instance == null) this._instance = new BridgeService();
        return this._instance;
    }

}

export enum BridgeIdentifier {
    bridge12v4cSon = '12v_sonoff',
    bridge220v1cSon = '220v_sonoff_oneChannel',
    bridge220v1cShelly = '220v_shelly_oneChannel',
    bridgeNeoPixelMultiple = 'multiple_neoPixel_controller',
    bridgeNeoPixelSingle = 'single_neoPixel_controller',
}
