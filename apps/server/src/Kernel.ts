import {AudioController} from "./controllers/AudioController";
import {BatteryController} from "./controllers/BatteryController";
import {DeviceController} from "./controllers/DeviceController";
import {FileController} from "./controllers/FileController";
import {HomeBridgeController} from "./controllers/HomeBridgeController";
import {HomeController} from "./controllers/HomeController";
import {LightController} from "./controllers/LightController";
import {LightGroupController} from "./controllers/LightGroupController";
import {VDRController} from "./controllers/VDRController";
import {SceneController} from "./controllers/SceneController";
import {SettingsController} from "./controllers/SettingsController";
import {TrackController} from "./controllers/TrackController";
import {WeatherController} from "./controllers/WeatherController";
import {AdminMiddleware} from "./middlewares/AdminMiddleware";
import {AuthMiddleware} from "./middlewares/AuthMiddleware";
import {CorsMiddleware} from "./middlewares/CorsMiddleware";
import {HomeBridgeMiddleware} from "./middlewares/HomeBridgeMiddleware";
import {LocalMiddleware} from "./middlewares/LocalMiddleware";
import {LogUrlMiddleware} from "./middlewares/LogUrlMiddleware";
import {UserController} from "./controllers/UserController";
import {TemplateVDRController} from "./controllers/TemplateVDRController";
import {AlarmController} from "./controllers/AlarmController";
import {LogbookArchiveController} from "./controllers/LogbookArchiveController";
import {EngineLogController} from "./controllers/EngineLogController";
import {ElectricityConsumptionController} from "./controllers/ElectricityConsumptionController";
import {NightModeController} from "./controllers/NightModeController";
import {DataController} from "./controllers/DataController";

export const ControllerRegistry = {
    AudioController: new AudioController(),
    BatteryController: new BatteryController(),
    DeviceController: new DeviceController(),
    FileController: new FileController(),
    HomeBridgeController: new HomeBridgeController(),
    HomeController: new HomeController(),
    LightController: new LightController(),
    LightGroupController: new LightGroupController(),
    VDRController: new VDRController(),
    SceneController: new SceneController(),
    SettingsController: new SettingsController(),
    TrackController: new TrackController(),
    WeatherController: new WeatherController(),
    UserController: new UserController(),
    TemplateVDRController: new TemplateVDRController(),
    AlarmController: new AlarmController(),
    LogbookArchiveController: new LogbookArchiveController(),
    EngineLogController: new EngineLogController(),
    ElectricityConsumptionController: new ElectricityConsumptionController(),
    NightModeController: new NightModeController(),
    DataController: new DataController()
}

export const MiddlewareRegistry = {
    AdminMiddleware: new AdminMiddleware(),
    AuthMiddleware: new AuthMiddleware(),
    CorsMiddleware: new CorsMiddleware(),
    HomeBridgeMiddleware: new HomeBridgeMiddleware(),
    LocalMiddleware: new LocalMiddleware(),
    LogUrlMiddleware: new LogUrlMiddleware()
}
