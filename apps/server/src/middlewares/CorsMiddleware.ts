import express from "express";
import {IMiddleware} from "./IMiddleware";

export class CorsMiddleware implements IMiddleware {

    handle(req: express.Request, res: express.Response, next: express.NextFunction) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

        if (req.method === "OPTIONS") {
            res.status(200).end();
            return;
        }

        next();
    }

}
