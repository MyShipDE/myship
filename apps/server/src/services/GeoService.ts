import * as superagent from 'superagent';
import {Log} from "./helpers/Log";

export class GeoService {

    static isInsideCountry(point: number[], vs: number[][]) {
        var x = point[0], y = point[1];

        var inside = false;
        for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            var xi = vs[i][0], yi = vs[i][1];
            var xj = vs[j][0], yj = vs[j][1];

            var intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }

        return inside;
    };

    static async getCountryCoordinates(countryCode: string): Promise<number[]> {
        try {
            const result = await superagent.get('https://restcountries.com/v3.1/alpha/' + countryCode);
            if (result.status !== 200) {
                Log.error('HTTP-REQ - GET Country Information')
                return;
            }
            return result.body[0].latlng;
        } catch (e) {
            //
        }
    }

    static async getCountryBorders(countryCode: string): Promise<string[]> {
        try {
            const result = await superagent.get('https://restcountries.com/v3.1/alpha/' + countryCode);
            if (result.status !== 200) {
                Log.error('HTTP-REQ - GET Country Information')
                return;
            }
            return result.body[0].borders;
        } catch (e) {
            //
        }
    }

    static async getBorderCoordinates(countryCode: string): Promise<number[][]> {
        const coordinates: number[][] = [];
        const countryBorders = await this.getCountryBorders(countryCode);
        for (const border of countryBorders) {
            coordinates.push(await this.getCountryCoordinates(border));
        }
        return coordinates;
    }

}
