import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AlarmService} from './services/alarm.service';
import {AlertsService} from './services/alerts.service';
import {AuthService} from './services/auth.service';
import {BaseService} from './services/base.service';
import {ClientService} from './services/client.service';
import {CustomRecordService} from './services/customRecord.service';
import {DeviceService} from './services/device.service';
import {ElectricityConsumptionService} from './services/electricityConsumption.service';
import {EngineMeterService} from './services/engineMeter.service';
import {HttpService} from './services/http.service';
import {LightService} from './services/light.service';
import {LightGroupService} from './services/lightGroup.service';
import {SceneService} from './services/scene.service';
import {TrackService} from './services/track.service';
import {VdrService} from './services/vdr.service';
import {TemplateVDRService} from './services/templateVDR.service';
import {NightModeService} from './services/nightMode.service';
import {HostService} from "./services/host.Service";
import {CryptoService} from "./services/crypto.service";
import {CloudAuthService} from "./services/cloud-auth.service";
import {environment} from "../../environments/environment";
import {CloudUserService} from "./services/cloud-user.service";
import {CloudGatewayService} from "./services/cloud-gateway.service";
import {CloudUserDetailsService} from "./services/cloud-user-details.service";
import {DataService} from "./services/data.service";

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    AlarmService,
    AlertsService,
    AuthService,
    BaseService,
    ClientService,
    CustomRecordService,
    DeviceService,
    ElectricityConsumptionService,
    EngineMeterService,
    HttpService,
    LightService,
    LightGroupService,
    SceneService,
    TrackService,
    VdrService,
    TemplateVDRService,
    NightModeService,
    HostService,
    CryptoService,
    BaseService,
    CloudAuthService,
    CloudUserService,
    CloudGatewayService,
    CloudUserDetailsService,
    DataService
  ]
})
export class ClientSDKModule {
  constructor(private hostService: HostService) {
    this.hostService.host = environment.cloud.host;
    this.hostService.protocol = environment.cloud.protocol;
    this.hostService.port = environment.cloud.port;
    this.hostService.path = environment.cloud.path;
  }
}
