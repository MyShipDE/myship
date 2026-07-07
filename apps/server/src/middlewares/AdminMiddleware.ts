import express from "express";
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import {Client} from "../modals/Client";
import {IMiddleware} from "./IMiddleware";
import {Storage} from "../DatabaseProvider";
import {CloudService} from "../services/CloudService";

dotenv.config();

export class AdminMiddleware implements IMiddleware {

    async handle(req: express.Request, res: express.Response, next: express.NextFunction) {
        const ip = req.ip.replace('::ffff:', '');
        let client = await Storage.getInstance().Client.findOneBy({ip});

        if (client != null) {
            if (client.isAdmin) {
                // Auth by IP
                next();
                return;
            } else {
                // Auth failed - No Admin Access
                res.status(401).end();
                return;
            }
        } else if (CloudService.Instance.fingerprint != null && req.header("Authorization") != null && CloudService.Instance.fingerprint === req.header("Authorization")) {
            // Auth by Fingerprint
            next();
            return;
        } else {
            if (req.header("Authorization") != null || req.query.auth != null) {

                let secret: string = null

                if (req.query.auth != null) {
                    secret = req.query.auth + '';
                } else if (req.header("Authorization") != null) {
                    secret = req.header("Authorization");
                }

                const secretArr = secret.split('-');
                const identifier: string = secretArr[0];
                client = await Storage.getInstance().Client.findOneBy({identifier});

                if (client != null && client.isAdmin) {

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
    };

}
