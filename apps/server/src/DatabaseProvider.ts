import "reflect-metadata"
import {DataSource} from "typeorm"
import dotenv from "dotenv";
import {AddressComponent} from "./modals/AddressComponent";
import {BatteryLog} from "./modals/BatteryLog";
import {Bridge} from "./modals/Bridge";
import {Client} from "./modals/Client";
import {Device} from "./modals/Device";
import {File} from "./modals/File";
import {Light} from "./modals/Light";
import {LightGroup} from "./modals/LightGroup";
import {LogbookManualInput} from "./modals/LogbookManualInput";
import {LogbookManualInputType} from "./modals/LogbookManualInputType";
import {Scene} from "./modals/Scene";
import {Setup} from "./modals/Setup";
import {Track} from "./modals/Track";
import {VoiceEntry} from "./modals/VoiceEntry";
import {TemplateVDR} from "./modals/TemplateVDR";
import {ManualEntry} from "./modals/ManualEntry";
import {SignalKDatasource} from "./modals/SignalKDatasource";
import {Alarm} from "./modals/Alarm";
import {AlarmProtocol} from "./modals/AlarmProtocol";
import {BridgeType} from "./modals/BridgeType";
import {EngineLog} from "./modals/EngineLog";
import {ElectricityConsumption} from "./modals/ElectricityConsumption";
import {EngineHourMeterRecord} from "./modals/EngineHourMeterRecord";
import {TrackData} from "./modals/TrackData";
import {TrackDataKey} from "./modals/TrackDataKey";
import {TrackDataUnit} from "./modals/TrackDataUnit";
import {TrackRecord} from "./modals/TrackRecord";
import path from "path";

dotenv.config({
    path: `${__dirname}/../.env`
});

export class Storage {
    private static _Instance: Storage;

    private static readonly databaseFile = 'database.sqlite';

    static get SQLITE_PATH() {
        if (process.env.SQLITE_PATH != null && process.env.SQLITE_PATH !== "") {
            return path.join(process.env.SQLITE_PATH, this.databaseFile);
        } else {
            return path.join(__dirname, "..", this.databaseFile);
        }
    }

    static get DatabaseOptions() {
        if (process.env.MYSQL_HOSTNAME != null && process.env.MYSQL_HOSTNAME !== ""
            && process.env.MYSQL_USERNAME != null && process.env.MYSQL_USERNAME !== ""
            && process.env.MYSQL_PASSWORD != null && process.env.MYSQL_PASSWORD !== ""
            && process.env.MYSQL_DATABASE != null && process.env.MYSQL_DATABASE !== "") {
            return mysqlOptions;
        } else {
            return sqliteOptions;
        }
    }

    AddressComponent = AppDataSource.getRepository(AddressComponent);
    BatteryLog = AppDataSource.getRepository(BatteryLog);
    Bridge = AppDataSource.getRepository(Bridge);
    BridgeType = AppDataSource.getRepository(BridgeType);
    Client = AppDataSource.getRepository(Client);
    Device = AppDataSource.getRepository(Device);
    File = AppDataSource.getRepository(File);
    Light = AppDataSource.getRepository(Light);
    LightGroup = AppDataSource.getRepository(LightGroup);
    LogbookManualInput = AppDataSource.getRepository(LogbookManualInput);
    LogbookManualInputType = AppDataSource.getRepository(LogbookManualInputType);
    Scene = AppDataSource.getRepository(Scene);
    Setup = AppDataSource.getRepository(Setup);
    Track = AppDataSource.getRepository(Track);
    VoiceEntry = AppDataSource.getRepository(VoiceEntry);
    ManualEntry = AppDataSource.getRepository(ManualEntry);
    TemplateVDR = AppDataSource.getRepository(TemplateVDR);
    SignalKDatasource = AppDataSource.getRepository(SignalKDatasource);
    Alarm = AppDataSource.getRepository(Alarm);
    AlarmProtocol = AppDataSource.getRepository(AlarmProtocol);
    EngineLog = AppDataSource.getRepository(EngineLog);
    ElectricityConsumption = AppDataSource.getRepository(ElectricityConsumption);
    EngineHourMeterRecord = AppDataSource.getRepository(EngineHourMeterRecord);
    TrackData = AppDataSource.getRepository(TrackData);
    TrackDataKey = AppDataSource.getRepository(TrackDataKey);
    TrackDataUnit = AppDataSource.getRepository(TrackDataUnit);
    TrackRecord = AppDataSource.getRepository(TrackRecord);

    static getInstance(): Storage {
        if (this._Instance == null) this._Instance = new Storage();
        return this._Instance;
    }

}

const entities = [
    AddressComponent,
    BatteryLog,
    Bridge,
    BridgeType,
    Client,
    Device,
    File,
    Light,
    LightGroup,
    LogbookManualInput,
    LogbookManualInputType,
    Scene,
    Setup,
    Track,
    VoiceEntry,
    ManualEntry,
    TemplateVDR,
    SignalKDatasource,
    Alarm,
    AlarmProtocol,
    EngineLog,
    ElectricityConsumption,
    EngineHourMeterRecord,
    TrackData,
    TrackDataKey,
    TrackDataUnit,
    TrackRecord
];

const mysqlOptions: any = {
    type: "mysql",
    host: process.env.MYSQL_HOSTNAME,
    port: 3306,
    username: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    synchronize: true,
    logging: false,
    entities,
    subscribers: [],
    migrations: []
}

const sqliteOptions: any = {
    type: 'sqlite',
    database: Storage.SQLITE_PATH,
    synchronize: true,
    logging: false,
    entities,
    subscribers: [],
    migrations: []
}

export const AppDataSource: DataSource = new DataSource(Storage.DatabaseOptions);
