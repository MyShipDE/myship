import dotenv from 'dotenv';
import {Log} from "./services/helpers/Log";
import {Message} from "./resources/Message";
import {ValidateService} from "./services/ValidateService";
import {DatabaseHelper} from "./services/helpers/DatabaseHelper";
import {LogbookService} from "./services/LogbookService";
import lightService from "./services/lightService";
import {SettingsService} from "./services/SettingsService";
import {CloudService} from "./services/CloudService";
import {SignalKHelper} from "./services/helpers/SignalKHelper";
import {AppDataSource, Storage} from "./DatabaseProvider";
import {WirelessButtonService} from "./services/WirelessButtonService";
import {TemplateService} from "./services/VDR/TemplateService";
import {AlarmService} from "./services/AlarmService";
import {SMS} from "./services/Notifications/SMS";
import {BridgeService} from "./services/BridgeService";
import {UpdateService} from "./services/UpdateService";
import {JobSchedule} from "./services/JobSchedule";
import {CustomEvent} from "./services/CustomEvent";
import * as process from "process";
import {TrackService} from "./services/VDR/TrackService";
import {SignalKDatasource} from "./modals/SignalKDatasource";
import {UnitHelper} from "./services/helpers/UnitHelper";
import {DataSource} from "typeorm";
import {App} from "./app";
import {ModemBaseService} from "./services/modem/ModemBaseService";
import {VeDirectService} from "./services/VeDirectService";
import {BluetoothService} from "./services/BluetoothService";

dotenv.config();

export default async () => {

    if (!new ValidateService().configuration()) {
        process.exit(0);
    }

    await AppDataSource.initialize();

    SMS.Instance.initialize();

    await SettingsService.Instance.boot();
    await AlarmService.Instance.Boot();

    CloudService.Instance.helloRequest().then(() => {
        TrackService.Instance.ensureTrackDataKeysSynced().then();
        TrackService.Instance.updateTrackDataKeys().then();
    });

    await LogbookService.createTypesIfNotExists();

    if (!App.vdrOnly) {
        await lightService.resetLightStateIfRelayOff();
    }

    if (process.env.RESTART_SIGNALK.toLowerCase() === 'true') {
        await SignalKHelper.getInstance().restart();
    }

    await TemplateService.getInstance().EnsureTemplatesExists();

    if (!App.vdrOnly) {
        await BridgeService.getInstance().boot();
        WirelessButtonService.Instance.listen();
    }

    SignalKHelper.getInstance().handleAndCacheData();

    UpdateService.Instance.setGPSPerms();

    if (!App.vdrOnly) {
        // Register Events
        CustomEvent.getInstance().ensureBatteryChargerActive();
        CustomEvent.getInstance().ensureLightPowerSupplyState();

        // Register SignalK DataSources
        VeDirectService.init();
    }

    SignalKHelper.getInstance().fixPathNames().then();

    if (App.shouldConnectWithModem) {
        const modem = new ModemBaseService();
        modem.init();
    }

    BluetoothService.getInstance().setup();

    setTimeout(() => {
        JobSchedule.Instance.run();
    }, 1000 * 10);

}
