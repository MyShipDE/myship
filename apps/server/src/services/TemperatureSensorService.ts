import {SocketIO} from "./socket.io/SocketIO";
import {Log} from "./helpers/Log";

// tslint:disable-next-line:no-var-requires
// const W1Temp = require('w1temp');

export class TemperatureSensorService {

    static sensors: any;
    static data: TemperatureSensor[] = new Array<TemperatureSensor>();

    static prepare(): void {
        /* W1Temp.getSensorsUids().then((sensorIDs: any) => {
            this.sensors = sensorIDs;
            this.schedule();
        }); */
    }

    static schedule(): void {
        if (this.sensors.length > 0) {
            setInterval(async () => {
                for (const sensor of this.sensors) {
                    await this.getAndSendSensor(sensor);
                }
                // SocketIO.emit('temperatureSensor', this.data);
            }, 1000);
        }
    }

    static getAndSendSensor(sensorID: string): Promise<void> {
        return new Promise(resolve => {
            /* W1Temp.getSensor(sensorID).then(async (sensor: any) => {
                const temperature = await sensor.getTemperatureAsync();
                if (this.data.find(x => x.name === sensorID) == null) {
                    this.data.push({
                        name: sensorID,
                        value: temperature
                    });
                } else {
                    this.data.find(x => x.name === sensorID).value = temperature;
                }
                resolve();
            }); */
        });
    }

}

interface TemperatureSensor {
    name: string,
    value: number
}
