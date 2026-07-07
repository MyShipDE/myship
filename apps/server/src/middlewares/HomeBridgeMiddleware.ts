import express from "express";
import dotenv from 'dotenv';
import {IMiddleware} from "./IMiddleware";

dotenv.config();

export class HomeBridgeMiddleware implements IMiddleware {

    async handle(req: express.Request, res: express.Response, next: express.NextFunction) {

        if (process.env.API_KEY != null && req.params.authorization != null && process.env.API_KEY === req.params.authorization) {
            next();
            return;
        }

        res.status(401).end();
    }

}
