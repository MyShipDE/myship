import express from "express";
import {Log} from "../services/helpers/Log";
import {IMiddleware} from "./IMiddleware";

export class LogUrlMiddleware implements IMiddleware {

    handle(req: express.Request, res: express.Response, next: express.NextFunction) {
        // const ip = req.ip.replace('::ffff:', '');
        Log.info("\x1b[31m" + req.method + "\x1b[0m " + req.url);
        next();
    }

}
