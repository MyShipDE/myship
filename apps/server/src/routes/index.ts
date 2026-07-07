// Import Express
import Router from 'express';
import {ControllerRegistry, MiddlewareRegistry} from "../Kernel";
import {ElectricityConsumptionController} from "../controllers/ElectricityConsumptionController";

// Set Router
const router = Router();

const AuthMiddleware = MiddlewareRegistry.AuthMiddleware.handle;
const AdminMiddleware = MiddlewareRegistry.AdminMiddleware.handle;
const LocalMiddleware = MiddlewareRegistry.LocalMiddleware.handle;

const UserController = ControllerRegistry.UserController;
const LightGroupController = ControllerRegistry.LightGroupController;
const LightController = ControllerRegistry.LightController;
const SceneController = ControllerRegistry.SceneController;
const DeviceController = ControllerRegistry.DeviceController;
const FileController = ControllerRegistry.FileController;
const TrackController = ControllerRegistry.TrackController;
const SettingsController = ControllerRegistry.SettingsController;
const BatteryController = ControllerRegistry.BatteryController;
const HomeController = ControllerRegistry.HomeController;
const VDRController = ControllerRegistry.VDRController;
const AlarmController = ControllerRegistry.AlarmController;
const LogbookArchiveController = ControllerRegistry.LogbookArchiveController;
const EngineLogController = ControllerRegistry.EngineLogController;
const NightModeController = ControllerRegistry.NightModeController;
const DataController = ControllerRegistry.DataController;

// -- Routes --

// User / Clients
router.post("/login", UserController.login);
router.post("/client", AdminMiddleware, UserController.createClient);
router.get("/client", AuthMiddleware, UserController.getUser);
router.get("/clients", AdminMiddleware, UserController.getClients);
router.get("/client/saveSession/:uuid", UserController.saveSession);
router.delete("/client/:id", AdminMiddleware, UserController.deleteClient);

// LightGroups
router.get("/lightGroups", AuthMiddleware, LightGroupController.getAll);
router.get("/lightGroup/:id", AuthMiddleware, LightGroupController.getOne);
router.post("/lightGroup", AuthMiddleware, LightGroupController.update);
router.delete("/lightGroup/:id", AuthMiddleware, LightGroupController.delete);
router.post("/lights/group/control", AuthMiddleware, LightGroupController.control);

// Lights
router.get("/lights", AuthMiddleware, LightController.getAll);
router.get("/light/:id", AuthMiddleware, LightController.get);
router.post("/light/control", AuthMiddleware, LightController.control);
router.post("/light", AuthMiddleware, LightController.create); // Create Light
router.put("/light", AuthMiddleware, LightController.update); // Edit Light
router.delete("/light/:id", AuthMiddleware, LightController.remove); // Delete Light

// Scenes
router.get("/scenes/:id", AuthMiddleware, SceneController.getAllByGroup);
router.get("/scene/:id", AuthMiddleware, SceneController.getOne);
router.delete("/scene/:id", AuthMiddleware, SceneController.deleteScene);
router.post("/scene", AuthMiddleware, SceneController.create);
router.put("/scene", AuthMiddleware, SceneController.update);
router.post("/scene/link", AuthMiddleware, SceneController.link);
router.post("/scene/unlink", AuthMiddleware, SceneController.unlink);

// Devices
router.get("/devices", AuthMiddleware, DeviceController.get);
router.get("/device/:id", AuthMiddleware, DeviceController.getOne);
router.get("/device/:id/status", AuthMiddleware, DeviceController.getStatus);
router.post("/device/control", AuthMiddleware, DeviceController.control);
router.put("/device", AuthMiddleware, DeviceController.Put);
router.delete("/device/:id", AuthMiddleware, DeviceController.Delete);

router.get("/bridges", AuthMiddleware, DeviceController.GetBridges);

// NightMode
router.get("/nightmode", AuthMiddleware, NightModeController.getState);
router.put("/nightmode", AuthMiddleware, NightModeController.put);

// File Management
router.get("/files", AuthMiddleware, FileController.getFilesMeta);
router.get("/file/:id", AuthMiddleware, FileController.getFile);
router.get("/file/meta/:id", AuthMiddleware, FileController.getFileMeta);
router.delete("/file/:id", AuthMiddleware, FileController.delete);
router.post("/file", AuthMiddleware, FileController.saveFile);
router.post("/dir", AuthMiddleware, FileController.createDir);

// BlackBox / Track-Management
router.get('/track/data/keys', AuthMiddleware, TrackController.getTrackDataKeys);
router.get('/track/data/units', AuthMiddleware, TrackController.getTrackDataUnits);
router.get('/track/data/:recordId/:key', AuthMiddleware, TrackController.getTrackDataByKey);
router.get('/track/last', AuthMiddleware, TrackController.getLastTrack);
router.get('/track/:id', AuthMiddleware, TrackController.getTrack);
router.get('/record/:id', AuthMiddleware, TrackController.getRecordById);
router.get('/tracks', AuthMiddleware, TrackController.getTracks);
router.put('/track', AuthMiddleware, TrackController.PutChangeTrackName);

// Logbook Configuration (Manual Entries)
router.get('/logbook/manualInputs', AuthMiddleware, VDRController.GetManualInputs);
router.get('/logbook/entries/voice', AuthMiddleware, LogbookArchiveController.GetVoiceEntries);
router.get('/logbook/manualInputs/types', AuthMiddleware, VDRController.GetManualInputTypes);
router.post('/logbook/manualInput', AuthMiddleware, VDRController.PostManualInput);
router.delete('/logbook/manualInput/:id', AuthMiddleware, VDRController.DeleteManualInput);

// Archive
router.get('/tracks/count', AuthMiddleware, LogbookArchiveController.GetCountTracks);
router.get('/tracks/date/:date/:page', AuthMiddleware, LogbookArchiveController.GetByDate);
router.get('/tracks/by/country', LogbookArchiveController.GetByCountry);
router.get('/tracks/dates', AuthMiddleware, LogbookArchiveController.GetAvailableDates);
router.get('/tracks/:page', AuthMiddleware, LogbookArchiveController.GetAll);
router.get('/tracks/custom/:take/:skip', AuthMiddleware, LogbookArchiveController.GetAllByDetails);
router.get('/tracks/coords/:start/:end', AuthMiddleware, LogbookArchiveController.GetCoordsByDateRange);

// TEMP DELETE REQUESTS
router.get("/delete/file/:id", AuthMiddleware, FileController.delete);
router.get("/delete/client/:id", AdminMiddleware, UserController.deleteClient);

// Settings / Data
router.get("/storage/:token", AuthMiddleware, SettingsController.Get);
router.post("/storage/number", AuthMiddleware, SettingsController.PostNumber);
router.post("/storage/string", AuthMiddleware, SettingsController.PostString);

// Battery Management
router.get("/battery/logs", AuthMiddleware, BatteryController.GetAll);

// EngineLog (EngineMeter)
router.get("/engine/hours", AuthMiddleware, EngineLogController.GetEngineHours);
router.get("/engine/hours/day", AuthMiddleware, EngineLogController.GetEngineHoursByDay);

// Alarm Management
router.get("/alarms", AuthMiddleware, AlarmController.Get);
router.get("/sensors", AuthMiddleware, AlarmController.GetSensors);
router.put("/alarm", AuthMiddleware, AlarmController.Put);
router.delete("/alarm/:id", AuthMiddleware, AlarmController.Delete);

// Signal K / DataSources
router.get("/data", AuthMiddleware, DataController.getData);

// Default
router.get("/test", HomeController.test);
router.get("/licence", LocalMiddleware, HomeController.getLicence);
router.get("/*", HomeController.send);

export default router;
