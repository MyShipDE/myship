import lightService from '../services/lightService';
import express from "express";
import {SettingsService} from "../services/SettingsService";
import {DataRegistryName} from "../resources/RegistryProperties";
import {NightModeService} from "../services/NightModeService";
import {Log} from "../services/helpers/Log";

export class NightModeController {

    async getState(req: express.Request, res: express.Response) {
        try {
            await SettingsService.Instance.pull();
            const nightMode = SettingsService.Instance.findProperty(DataRegistryName.NightModeState);
            res.status(200).send(nightMode);
        } catch (e) {
            res.status(500).end();
        }
    }

    async put(req: express.Request, res: express.Response) {
        try {

            if (req.body.state == null) {
                return res.status(400).end();
            }

            const state = req.body.state;

            if (state || state === 'true' || state === '1') {
                await NightModeService.getInstance().enable();
            } else {
                await NightModeService.getInstance().disable();
            }

            res.status(200).end();
        } catch (e) {
            Log.error('Error while setting night mode state' + e);
            res.status(500).end();
        }
    }


}
