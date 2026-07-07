import {Observable, Subject} from "rxjs";
import {Storage} from "../DatabaseProvider";
import {BridgeIdentifier} from "./BridgeService";
import {ShellyService} from "./ShellyService";
import {SocketChannel} from "../resources/SocketChannel";
import {SocketIO} from "./socket.io/SocketIO";
import LightService from "./lightService";

export class CustomEvent {

    private static _instance: CustomEvent;

    public static PowerConnectedObserver: Subject<void> = new Subject<void>();
    public static PowerDisconnectObserver: Subject<void> = new Subject<void>();

    private PowerState?: boolean;

    async CheckPowerConnection() {
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

        if (bridgeType.bridges != null && bridgeType.bridges.length != null && bridgeType.bridges.length > 0) {
            const bridge = bridgeType.bridges[0];
            if (await ShellyService.isOnline(bridge)) {
                if (this.PowerState == null) {
                    this.PowerState = true;
                } else if (!this.PowerState) {
                    CustomEvent.PowerConnectedObserver.next();
                    SocketIO.emit(SocketChannel.PowerConnectionObject, true);
                    this.PowerState = true;
                }
            } else {
                if (this.PowerState == null) {
                    this.PowerState = false;
                } else if (this.PowerState) {
                    CustomEvent.PowerDisconnectObserver.next();
                    SocketIO.emit(SocketChannel.PowerConnectionObject, false);
                    this.PowerState = false;
                }
            }
        }

    }

    ensureBatteryChargerActive() {
        CustomEvent.PowerConnectedObserver.subscribe(async () => {
            const bridges = await Storage.getInstance().Bridge.find({
                relations: {
                    devices: true
                }
            });
            const bridge = bridges.find(x => x.name.toLowerCase().includes('battery'));
            if (bridge != null && !(await ShellyService.getState(bridge))) {
                await ShellyService.control(bridge, true);
            }
        })
    }

    ensureLightPowerSupplyState() {
        CustomEvent.PowerDisconnectObserver.subscribe(() => {
            LightService.disablePowerSupplyIfPossible().then();
            ShellyService.ensureStatesInactive().then();
        });
        CustomEvent.PowerConnectedObserver.subscribe(() => {
            LightService.enablePowerSupplyIfPossible().then();
        });
    }

    public static getInstance() {
        if (this._instance == null) this._instance = new CustomEvent();
        return this._instance;
    }

}
