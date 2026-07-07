import mqtt from "mqtt";
import dotenv from "dotenv";
import {NavigationDataSet} from "../modals/SignalK/Navigation.DataSet";

dotenv.config();

export class MQTTService {

    private static Instance: MQTTService;
    public static LastNavigationData: NavigationDataSet;

    private mqttClient: mqtt.Client;
    private navigationDataSet: NavigationDataSet;

    /* TryFillNavigationDataSet() {
        this.mqttClient = mqtt.connect(`mqtt://${process.env.MQTT_BROKER_HOST}:${process.env.MQTT_BROKER_PORT}`);

        this.mqttClient.on('connect', () => {
            AlarmProtocol.debug('MQTT-Client zum lauschen von neuen GPS-Einträgen verbunden!')
            this.mqttClient.subscribe([
                'serial/gps/#'
            ]);
        })

        let date: string = null;
        let time: string = null
        if (this.navigationDataSet == null) {
            this.navigationDataSet = new NavigationDataSet();
        }

        this.mqttClient.on('message', async (topic: string, message: any) => {
            const value = message.toString();

            switch (topic) {
                case 'serial/gps/lon':
                    const lonGrad = value.substring(0, 3);
                    const lonMinutes = value.substring(4);
                    this.navigationDataSet.longitude = +((+lonMinutes / 60) + +lonGrad);
                    break;
                case 'serial/gps/lat':
                    const latGrad = value.substring(0, 2);
                    const latMinutes = value.substring(3);
                    this.navigationDataSet.latitude = +((+latMinutes / 60) + +latGrad);
                    break;
                case 'serial/gps/date':
                    const day = value.substring(0, 2);
                    const month = value.substring(2, 4);
                    const year = value.substring(4, 6);
                    date = `20${year}-${month}-${day}`;
                    break;
                case 'serial/gps/time':
                    const hour = value.substring(0, 2);
                    const minute = value.substring(2, 4);
                    const second = value.substring(5, 8);
                    time = `T${hour}:${minute}:${second}`;
                    break;
                case 'serial/gps/high':
                    this.navigationDataSet.high = +value;
                    break;
                case 'serial/gps/sog':
                    this.navigationDataSet.speedOverGround = +value;
                    break;
            }

            if (date != null && time != null) {
                this.navigationDataSet.datetime = date + time;
            }

            if (this.navigationDataSet.datetime != null &&
                this.navigationDataSet.speedOverGround != null &&
                this.navigationDataSet.high != null &&
                this.navigationDataSet.latitude != null &&
                this.navigationDataSet.longitude != null &&
                this.navigationDataSet.latitude !== 0 &&
                this.navigationDataSet.longitude !== 0
            ) {
                // Handle Date
                // await TrackService.Instance.logData(this.navigationDataSet);
                // ------------
                MQTTService.LastNavigationData = this.navigationDataSet;
                this.navigationDataSet = new NavigationDataSet();
                date = null;
                time = null;
            }

        });

    } */

    static getInstance(): MQTTService {
        if (this.Instance == null) this.Instance = new MQTTService();
        return this.Instance;
    }

}
