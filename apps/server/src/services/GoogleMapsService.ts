import dotenv from "dotenv";
import request from "superagent";
import * as validator from "validator";

dotenv.config();

export class GoogleMapsService {

    private url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lon}&sensor=true&key={apiKey}';
    private readonly apiKey = process.env.GOOGLE_MAPS_API_KEY;

    constructor(public lat: number, public lon: number) {
        if (this.lat != null && this.lon != null && this.apiKey != null) {
            this.url = this.url.replace('{lat}', this.lat.toString());
            this.url = this.url.replace('{lon}', this.lon.toString());
            this.url = this.url.replace('{apiKey}', this.apiKey);
        }
    }

    async getResult(): Promise<string[]> {
        const arr: string[] = [];
        try {
            const res = await request
                .get(this.url)
                .set('accept', 'json');
            if (res.status === 200) {
                if (res.body.status === 'OK' && res.body.results != null && res.body.results.length != null) {
                    res.body.results.forEach((result: any) => {
                        if (result.address_components != null && result.address_components.length != null) {
                            result.address_components.forEach((component: any) => {
                                if (!arr.includes(component.long_name)
                                    && !validator.default.isNumeric(component.long_name)
                                    && !component.long_name.includes('+')) {
                                    arr.push(component.long_name);
                                }
                            });
                        }
                    });
                }
            }
        } catch (err) {
            //
        }
        return arr;
    }

}
