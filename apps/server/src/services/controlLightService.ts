import {Log} from "./helpers/Log";
import {Message} from "../resources/Message";
import request from "superagent";
import {Storage} from "../DatabaseProvider";
import FormData from 'form-data';
import {DeviceService} from "./deviceService";

export default async (host: string, r: number, g: number, b: number, brightness: number, length: number = 300) => {
    Log.debug(Message.SEND_BRIDGE_REQUEST);

    const relay = await Storage.getInstance().Device.findOneBy({id: +process.env.LED_POWERSUPLY_ID});
    if (relay == null) {
        return false;
    }

    if (!relay.isActive) {
        await DeviceService.control(relay.id);
    }

    return new Promise<boolean>(async (resolve) => {
        try {

            const formData = new FormData();
            formData.append('r', r);
            formData.append('g', g);
            formData.append('b', b);
            formData.append('brightness', brightness);
            formData.append('length', length);

            const buffer = formData.getBuffer();

            if (!relay.isActive) {
                setTimeout(async () => {
                    request
                        .post('http://' + host + '/api/v1/control')
                        .type('form')
                        .send({
                            r, g, b, brightness, length
                        })
                        .then()
                        .catch((e) => {
                            Log.error('[LED-CONTROL] ' + e);
                        })
                    resolve(true);
                }, 10000);
            } else {
                request
                    .post('http://' + host + '/api/v1/control')
                    .type('form')
                    .send({
                        r, g, b, brightness, length
                    })
                    .then()
                    .catch((e) => {
                        Log.error('[LED-CONTROL] ' + e);
                    })
                resolve(true);
            }
        } catch (err) {
            resolve(false);
        }
    });

};
