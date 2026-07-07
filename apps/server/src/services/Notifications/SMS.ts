import request from 'superagent';
import dotenv from 'dotenv';
import {String} from "../helpers/String";
import {Log} from "../helpers/Log";

dotenv.config();

export class SMS {

    private static _Instance: SMS;

    private gatewayHostname: string;
    private gatewayUsername: string;
    private gatewayPassword: string;

    initialize(): void {
        this.gatewayHostname = process.env.SMS_GATEWAY_HOSTNAME;
        this.gatewayUsername = process.env.SMS_GATEWAY_USERNAME;
        this.gatewayPassword = process.env.SMS_GATEWAY_PASSWORD;

        if (String.isNullOrEmpty(this.gatewayHostname) || String.isNullOrEmpty(this.gatewayUsername) || String.isNullOrEmpty(this.gatewayPassword)) {
            Log.error('[SMS-NOTIFY] Voreinstellungen fehlgeschlagen, bitte Konfiguration überprüfen!');
        }
    }

    async send(message: string, phone: string): Promise<boolean> {
        try {

            const response = await request
                .post(`http://${this.gatewayHostname}/cgi-bin/sms_send`)
                .type('form')
                .send({
                    username: this.gatewayUsername,
                    password: this.gatewayPassword,
                    number: phone,
                    text: message
                });

            return response.ok;

        } catch (e) {
            Log.error('[SMS-NOTIFY] Fehler beim Senden der SMS:');
            Log.error(e);
            return false;
        }
    }

    static get Instance(): SMS {
        if (this._Instance == null) {
            this._Instance = new SMS();
        }
        return this._Instance;
    }

}
