import dotenv from "dotenv";
import {Log} from "./helpers/Log";
import {String} from "./helpers/String";
import {App} from "../app";

dotenv.config();

export class ValidateService {

    configuration(): boolean {

        if (String.isNullOrEmpty(process.env.HTTP_HOST)) {
            return this.error("Der Eintrag (HTTP_HOST) in der Konfiguration ist nicht vorhanden!");
        } else if (String.isNullOrEmpty(process.env.HTTP_PORT)) {
            return this.error("Der Eintrag (HTTP_PORT) in der Konfiguration ist nicht vorhanden!");
        } else if (String.isNullOrEmpty(process.env.SIGNALK_HOST)) {
            return this.error("Der Eintrag (SIGNALK_HOST) in der Konfiguration ist nicht vorhanden!");
        } else if (String.isNullOrEmpty(process.env.SIGNALK_PORT)) {
            return this.error("Der Eintrag (SIGNALK_PORT) in der Konfiguration ist nicht vorhanden!");
        } else if (String.isNullOrEmpty(process.env.DEBUG)) {
            return this.error("Der Eintrag (DEBUG) in der Konfiguration ist nicht vorhanden!");
        } else if (String.isNullOrEmpty(process.env.APP_ENV)) {
            return this.error("Der Eintrag (APP_ENV) in der Konfiguration ist nicht vorhanden!");
        }

        if (!App.vdrOnly) {
            if (String.isNullOrEmpty(process.env.MQTT_PORT)) {
                return this.error("Der Eintrag (MQTT_PORT) in der Konfiguration ist nicht vorhanden!");
            } else if (String.isNullOrEmpty(process.env.SMTP_HOST)) {
                return this.error("Der Eintrag (SMTP_HOST) in der Konfiguration ist nicht vorhanden!");
            } else if (String.isNullOrEmpty(process.env.SMTP_USER)) {
                return this.error("Der Eintrag (SMTP_USER) in der Konfiguration ist nicht vorhanden!");
            } else if (String.isNullOrEmpty(process.env.SMTP_PASS)) {
                return this.error("Der Eintrag (SMTP_PASS) in der Konfiguration ist nicht vorhanden!");
            } else if (String.isNullOrEmpty(process.env.SMTP_PORT)) {
                return this.error("Der Eintrag (SMTP_PORT) in der Konfiguration ist nicht vorhanden!");
            } else if (String.isNullOrEmpty(process.env.SMTP_ADDR)) {
                return this.error("Der Eintrag (SMTP_ADDR) in der Konfiguration ist nicht vorhanden!");
            }
        }

        return true;

    }

    error(message: string): boolean {
        Log.error(message);
        return false;
    }

}
