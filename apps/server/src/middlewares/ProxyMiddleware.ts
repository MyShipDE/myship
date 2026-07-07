import express from "express";
import request from 'request';
import * as process from "process";

export class ProxyMiddleware {

    static osm(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            const x = req.params.x;
            const y = req.params.y;
            const z = req.params.z;
            const url = process.env.OSM_URL_PREFIX;
            if (url == null || x == null || y == null || z == null) {
                return res.status(400).end();
            }
            request(`${url}/${z}/${x}/${y}.png`).pipe(res);
        } catch (e) {
            return res.status(500).end();
        }
    }

}