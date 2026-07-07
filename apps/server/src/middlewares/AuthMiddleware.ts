import {Client} from '../modals/Client';
import express from "express";
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import {Log} from "../services/helpers/Log";
import {IMiddleware} from "./IMiddleware";
import {Storage} from "../DatabaseProvider";
import {CloudService} from "../services/CloudService";

dotenv.config();

export class AuthMiddleware implements IMiddleware {

    async handle(req: express.Request, res: express.Response, next: express.NextFunction) {
        const ip = req.ip.replace('::ffff:', '');
        Log.debug('[AUTH-MIDDLEWARE] Authentifizierung des Clients: ' + ip);
        let client = await Storage.getInstance().Client.findOneBy({ip});

        if (client != null) {
            Log.debug('Authentication by Client: ' + client.comment + ', by IP');
            // Auth by IP
            next();
            return;
        } else if (CloudService.Instance.fingerprint != null && req.header("Authorization") != null && CloudService.Instance.fingerprint === req.header("Authorization")) {
            // Auth by Fingerprint
            Log.debug('[AUTH-MIDDLEWARE] Authentifizierung by API-Token');
            next();
            return;
        } else {
            if (req.header("Authorization") != null || req.query.auth != null) {
                Log.debug('[AUTH-MIDDLEWARE] Authentifizierung des Clients by Token: ' + req.header("Authorization"));

                let secret: string = null

                if (req.query.auth != null) {
                    secret = req.query.auth + '';
                } else if (req.header("Authorization") != null) {
                    secret = req.header("Authorization");
                }

                const secretArr = secret.split('-');
                const identifier: string = secretArr[0];
                client = await Storage.getInstance().Client.findOneBy({identifier});

                if (client != null) {

                    if (client.ip != null && client.ip !== ip) {
                        // Auth failed - IP not matched
                        res.status(401).end();
                        return;
                    }

                    if (await bcrypt.compare(secret, client.secret)) {
                        next();
                        return;
                    } else {
                        // Auth failed - Encrypt Token mismatch
                        res.status(401).end();
                        return;
                    }
                }
            } else {
                res.status(400).end("Header is missing!");
                return;
            }
        }
        res.status(401).end();
    }

}
