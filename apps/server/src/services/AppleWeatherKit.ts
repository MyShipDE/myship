import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fs from "fs";
import request from "superagent";

export class AppleWeatherKit {

    private readonly privateKeyPath: string;
    private readonly privateKey: string;

    constructor() {
        dotenv.config();
        this.privateKeyPath = `${__dirname}/../../storage/WeatherKey.p8`;
        this.privateKey = fs.readFileSync(this.privateKeyPath).toString();
    }

    getAuthorizationToken(): string {
        // @ts-ignore
        return jwt.sign(
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
        try {
            const res = await request
                .get(`https://weatherkit.apple.com/api/v1/weather/en/${lat}/${lon}?dataSets=forecastDaily`)
                .set('Authorization', 'Bearer ' + this.getAuthorizationToken());
            return res.body;
        } catch (e) {
            return false;
        }
    }

}
