import request from 'superagent';
import {Track} from "../../modals/Track";

export class CountryGeolocationService {

    private static germanyQuery = `
        SELECT ST_ASGEOJSON(geom) AS geometry
        FROM ne_10m_admin_0_countries
        WHERE name = 'Germany'
    `;

    private static netherlandsQuery = `
        SELECT ST_ASGEOJSON(geom) AS geometry
        FROM ne_10m_admin_0_countries
        WHERE name = 'Netherlands'
    `;

    static async getCountryBounds(query: string) {
        const response = await request
            .get('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson')
            .set('Accept', 'application/json');

        const obj = JSON.parse(response.text);
        const feature = obj.features.find((f: { properties: { NAME_DE: string; }; }) => f.properties.NAME_DE === 'Deutschland');
        const coordinates = feature.geometry.coordinates[0].map((coord: any) => [coord[0], coord[1]]);
        console.log(feature.geometry.coordinates);
        return {coordinates};
    }

    static async isWithinBounds(coordinates: number[][], lat: number, lon: number) {
        const point = [lon, lat];
        let inside = false;

        for (let i = 0, j = coordinates.length - 1; i < coordinates.length; j = i++) {
            const xi = coordinates[i][0];
            const yi = coordinates[i][1];
            const xj = coordinates[j][0];
            const yj = coordinates[j][1];

            const intersect = ((yi > point[1]) !== (yj > point[1]))
                && (point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi);

            if (intersect) {
                inside = !inside;
            }
        }

        return inside;
    }

    static async filterTracksByLocation(tracks: Track[]) {
        const germanyBounds = await this.getCountryBounds(this.germanyQuery);
        // const netherlandsBounds = await this.getCountryBounds(this.netherlandsQuery);
        const filteredTracks = [];

        for (const track of tracks) {
            let isWithinLocation = false;

            if (isWithinLocation) {
                filteredTracks.push(track);
            }
        }

        return filteredTracks;
    }


}
