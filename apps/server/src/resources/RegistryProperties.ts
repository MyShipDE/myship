import {SettingsService} from "../services/SettingsService";

export const registerProperties = () => {
    SettingsService.Instance.registerProperty<boolean>(DataRegistryName.NightModeState, false);
    SettingsService.Instance.registerProperty<string>(DataRegistryName.LastVoyageDataRecorderCheck, new Date().toISOString());
}

export enum DataRegistryName {
    NightModeState = 'nightMode.state',
    LastVoyageDataRecorderCheck = 'vdr.lastCheck',
}
