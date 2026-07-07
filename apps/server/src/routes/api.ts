import {Router} from "express";
import {ControllerRegistry, MiddlewareRegistry} from "../Kernel";
import router from "./index";

const api = Router();

const AuthMiddleware = MiddlewareRegistry.AuthMiddleware.handle;
const AdminMiddleware = MiddlewareRegistry.AdminMiddleware.handle;

const HomeBridgeController = ControllerRegistry.HomeBridgeController;
const WeatherController = ControllerRegistry.WeatherController;
const HomeController = ControllerRegistry.HomeController;
const SettingsController = ControllerRegistry.SettingsController;
const AudioController = ControllerRegistry.AudioController;
const VDRController = ControllerRegistry.VDRController;
const TemplateVDRController = ControllerRegistry.TemplateVDRController;
const ElectricityConsumptionController = ControllerRegistry.ElectricityConsumptionController;

// HomeBridge Integration
api.get("/homeBridge/lightGroup/:id/state", AuthMiddleware, HomeBridgeController.GetLightGroupState);
api.get("/homeBridge/lightGroup/:id/on", AuthMiddleware, HomeBridgeController.PostLightGroupOn);
api.get("/homeBridge/lightGroup/:id/off", AuthMiddleware, HomeBridgeController.PostLightGroupOff);

api.get("/homeBridge/lightGroup/:id/brightness", AuthMiddleware, HomeBridgeController.GetLightGroupBrightness);
api.get("/homeBridge/lightGroup/:id/brightness/:bri", AuthMiddleware, HomeBridgeController.PutLightGroupBrightness);

api.get("/homeBridge/device/:id/state", AuthMiddleware, HomeBridgeController.getDeviceState);
api.get("/homeBridge/device/:id/:state", AuthMiddleware, HomeBridgeController.controlDevice);

api.get("/homeBridge/lightGroup/:id/rgb", AuthMiddleware, HomeBridgeController.GetLightGroupRGB);
api.get("/homeBridge/lightGroup/:id/rgb/:hex", AuthMiddleware, HomeBridgeController.PutLightGroupRGB);

api.get("/info", HomeController.getInfo);
api.post("/update", AdminMiddleware, SettingsController.Update);

api.get("/weather/current/:lat/:lon", AuthMiddleware, WeatherController.GetCurrentForecast);
api.get("/weather/forecast/:lat/:lon", AuthMiddleware, WeatherController.GetDailyForecast);

// VDR
api.post("/vdr/record/start", AuthMiddleware, AudioController.PostStartRecord);
api.post("/vdr/record/stop", AuthMiddleware, AudioController.PostStopRecord);
api.post("/vdr/record", AuthMiddleware, AudioController.PostRequestTranscribe);
api.post("/vdr/record/manual", AuthMiddleware, VDRController.PostManualRecord);
api.get("/vdr/messages", AuthMiddleware, AudioController.GetMessages);
api.post("/vdr/reminder", AuthMiddleware, VDRController.PostRecordReminder);
api.get("/vdr/position", AuthMiddleware, VDRController.GetPosition);

// VDR - Settings
api.get("/vdr/template/:name", AuthMiddleware, TemplateVDRController.GetOneByName);
api.get("/vdr/templates", AuthMiddleware, TemplateVDRController.GetAll);
api.put("/vdr/template", AuthMiddleware, TemplateVDRController.Put);

// SignalK
api.post("/signalk/restart", AuthMiddleware, SettingsController.PostRestartSignalK);

// Bluetooth Service
api.post("/bluetooth/discovery", AuthMiddleware, SettingsController.enableBluetoothDiscovery);
api.delete("/bluetooth/discovery", AuthMiddleware, SettingsController.disableBluetoothDiscovery);

// EngineLog (EngineMeter)
api.post("/electricityConsumption/save", AuthMiddleware, ElectricityConsumptionController.PostSave);
api.get("/electricityConsumption", AuthMiddleware, ElectricityConsumptionController.Get);
api.get("/electricityConsumption/stats", AuthMiddleware, ElectricityConsumptionController.GetStats);
api.get("/electricityConsumption/stats/:days", AuthMiddleware, ElectricityConsumptionController.GetStats);

api.post("/test/alarm", HomeController.testAlarm);

export default api;
