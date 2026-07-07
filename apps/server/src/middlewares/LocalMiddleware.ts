import express from "express";
import {IMiddleware} from "./IMiddleware";

export class LocalMiddleware implements IMiddleware {

    handle(req: express.Request, res: express.Response, next: express.NextFunction) {
        const host: string = req.hostname;
        const hostArr: string[] = host.split(":");

        const authorizedHosts: string = process.env.AUTHORIZED_HOSTS;
        const authorizedHostsArr: string[] = authorizedHosts.split("|");

        if (authorizedHostsArr.includes(hostArr[0])) {
            next();
            return;
        }

        res.status(401).end();

    }

}
