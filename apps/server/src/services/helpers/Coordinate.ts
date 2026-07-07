export class Coordinate {

    decimal: number;
    grad: number;
    minute: number;
    second: number;

    constructor(decimal: number) {
        this.decimal = decimal;
    }

    static getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
        const R = 6371; // Radius of the earth in km
        const dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    }

    static getDistanceFromLatLonInNM(lat1: number, lon1: number, lat2: number, lon2: number) {
        return this.getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) / 1.825;
    }

    static deg2rad(deg: any) {
        return deg * (Math.PI / 180)
    }

    convert2GradMinSecFormat(): boolean {
        if (this.decimal != null) {

            const decimalArr = (this.decimal + '').split('.'); // [50, 23983942]
            this.grad = +decimalArr[0];                                 // 50

            let temp: number = this.decimal - this.grad;                // 0,23983942
            temp = +(temp * 60);
            this.minute = +temp.toFixed(0);
            temp = temp - this.minute;

            temp = +(temp * 60);
            this.second = +temp.toFixed(0);

            return true;
        } else {
            return false;
        }
    }

}
