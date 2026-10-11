import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fs from "fs";
import request from "superagent";
import {DemoMode} from "./DemoMode/DemoMode";

export class AppleWeatherKit {

    private readonly privateKeyPath: string;
    private readonly privateKey: string;

    constructor() {
        dotenv.config();
        this.privateKeyPath = `${__dirname}/../../storage/WeatherKey.p8`;
        // In demo mode the WeatherKit key is absent on the VM — don't read it.
        this.privateKey = DemoMode.active ? '' : fs.readFileSync(this.privateKeyPath).toString();
    }

    getAuthorizationToken(): string {
        return (jwt.sign as any)(
            {
                sub: "com.myship.client",
            },
            this.privateKey,
            {
                issuer: "7NM45CDA57",
                expiresIn: "1h",
                keyid: "SUH56ZGFWY",
                algorithm: "ES256",
                header: {
                    id: "7NM45CDA57.com.myship.client",
                },
            }
        );
    }

    async getCurrent(lat: number, lon: number) {
        if (DemoMode.active) {
            return this.cannedCurrent();
        }
        try {
            const res = await request
                .get(`https://weatherkit.apple.com/api/v1/weather/en/${lat}/${lon}?dataSets=currentWeather`)
                .set('Authorization', 'Bearer ' + this.getAuthorizationToken());
            return res.body;
        } catch (e) {
            return false;
        }
    }

    async getForecastDaily(lat: number, lon: number) {
        if (DemoMode.active) {
            return this.cannedForecast();
        }
        try {
            const res = await request
                .get(`https://weatherkit.apple.com/api/v1/weather/en/${lat}/${lon}?dataSets=forecastDaily`)
                .set('Authorization', 'Bearer ' + this.getAuthorizationToken());
            return res.body;
        } catch (e) {
            return false;
        }
    }

    private cannedCurrent() {
        return {
            currentWeather: {
                temperature: 17.5,
                temperatureApparent: 16.2,
                windSpeed: 5.4,
                windDirection: 240,
                pressure: 1014,
                pressureTrend: 'steady',
                humidity: 0.7,
                conditionCode: 'PartlyCloudy',
            },
        };
    }

    private cannedForecast() {
        const day = 24 * 60 * 60 * 1000;
        const now = Date.now();
        const days = Array.from({length: 5}, (_, i) => ({
            forecastStart: new Date(now + i * day).toISOString(),
            temperatureMax: 19 + i,
            temperatureMin: 11 + i,
            conditionCode: i % 2 === 0 ? 'PartlyCloudy' : 'Clear',
            daytimeForecast: {windSpeed: 4 + i, windDirection: 220 + i * 10},
        }));
        return {forecastDaily: {days}};
    }

}
