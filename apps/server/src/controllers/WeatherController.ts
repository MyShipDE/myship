import {AppleWeatherKit} from "../services/AppleWeatherKit";
import express from "express";
import {SocketIO} from "../services/socket.io/SocketIO";
import {SocketChannel} from "../resources/SocketChannel";

export class WeatherController {

    async GetCurrentForecast(req: express.Request, res: express.Response) {
        const weatherKit = new AppleWeatherKit();

        if (req.params.lat == null || req.params.lon == null) {
            return res.status(400).end('LAT & LON Parameters are required!');
        }

        const data = await weatherKit.getCurrent(+req.params.lat, +req.params.lon);

        if (data === false) {
            return res.status(500).end();
        }

        SocketIO.emit(SocketChannel.WeatherApiCurrentForecastResult, data);
        res.status(200).send(data);
    }

    async GetDailyForecast(req: express.Request, res: express.Response) {
        const weatherKit = new AppleWeatherKit();

        if (req.params.lat == null || req.params.lon == null) {
            return res.status(400).end('LAT & LON Parameters are required!');
        }

        const data = await weatherKit.getForecastDaily(+req.params.lat, +req.params.lon);

        if (data === false) {
            return res.status(500).end();
        }

        SocketIO.emit(SocketChannel.WeatherApiDailyForecastResult, data);
        res.status(200).send(data);
    }

}
