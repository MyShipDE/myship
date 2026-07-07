import {NgModule, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {BrowserModule, HammerModule} from '@angular/platform-browser';
import {AppRoutingModule} from './app-routing.module';
import {GaugeModule} from 'angular-gauge';
import {FormsModule} from '@angular/forms';
import {QRCodeModule} from 'angularx-qrcode';
import {PdfViewerModule} from 'ng2-pdf-viewer';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {GaugesModule} from '@biacsics/ng-canvas-gauges';
import {ZXingScannerModule} from '@zxing/ngx-scanner';
import {SignalKClientModule} from 'signalk-client-angular';
import {AppComponent} from './app.component';
import {HomeComponent} from './components/pages/home/home.component';
import {InstrumentsComponent} from './components/pages/instruments/instruments.component';
import {LogbookComponent} from './components/pages/logbook/logbook.component';
import {NavigationComponent} from './components/pages/position-lights/navigation.component';
import {ShipComponent} from './components/pages/ship/ship.component';
import {VerbraucherComponent} from './components/pages/verbraucher/verbraucher.component';
import {WeatherComponent} from './components/pages/weather/weather.component';
import {LightsComponent} from './components/pages/lights/lights.component';
import {AlertsComponent} from './components/controls/alerts/alerts.component';
import {LoaderComponent} from './components/controls/loader/loader.component';
import {ShipImageComponent} from './components/controls/ship-image/ship-image.component';
import {MonitoringComponent} from './components/controls/monitoring/monitoring.component';
import {StatsBarComponent} from './components/pages/home/statsbar/component';
import {FilesComponent} from './components/pages/files/files.component';
import {CamComponent} from './components/pages/cam/cam.component';
import {InfoCardComponent} from './components/controls/card/component';
import {MaschineComponent} from './components/pages/instruments/maschine/instruments.component';
import {BatteryComponent} from './components/pages/battery/instruments.component';
import {UtcClockComponent} from './components/pages/home/utc-clock/utc-clock.component';
import {HeaderComponent} from './components/controls/header/header.component';
import {ItemCardComponent} from './components/pages/lights/ItemCard/ItemCard.Component';
import {ColorPickerComponent} from './components/pages/lights/ColorPicker/ColorPicker.component';
import {WidgetWindComponent} from './components/controls/widget-wind/widget-wind.component';
import {SvgWindComponent} from './components/controls/svg-wind/svg-wind.component';
import {ColorPickerKelvinComponent} from './components/pages/lights/ColorPickerKelvin/ColorPicker.component';
import {BrightnessComponent} from './components/pages/lights/Brightness/Brightness.Component';
import {ButtonComponent} from './components/controls/button/button.component';
import {SettingsMenuComponent} from './components/pages/settings/menu/settings.component';
import {ConnectionSettingsComponent} from './components/pages/settings/connections/settings.component';
import {ConnectionSettingsCardComponent} from './components/pages/settings/connections/card/settings.component';
import {ConnectionSettingsEditCardComponent} from './components/pages/settings/connections/edit/settings.component';
import {PlotterComponent} from './components/pages/avnav/navigation.component';
import {UserSettingsComponent} from './components/pages/settings/users/settings.component';
import {LightSettingsComponent} from './components/pages/settings/lights/settings.component';
import {SystemSettingsComponent} from './components/pages/settings/system/settings.component';
import {TemperatureComponent} from './components/pages/instruments/temperature/instruments.component';
import {BatteryElementComponent} from './components/controls/BatteryComponent/BatteryElementComponent';
import {WaterElementComponent} from './components/controls/WaterElementComponent/WaterElementComponent';
import {CustomSettingsComponent} from './components/pages/settings/custom/CustomSettingsComponent';
import {BatteryLargeElementComponent} from './components/controls/BatteryLargeComponent/BatteryLargeElementComponent';
import {BlackBoxSettingsComponent} from './components/pages/settings/blackbox/settings.component';
import {
  VideoPlayerElementComponent
} from './components/controls/VideoPlayerElementComponent/VideoPlayerElementComponent';
import {SignalKService} from './service/SignalK.Service';
import {DatepickerElementComponent} from './components/controls/DatepickerElementComponent/DatepickerElementComponent';
import {CustomRecordComponent} from './components/pages/logbook/CustomRecord/CustomRecord.component';
import {BlackBoxKeywordsSettingsComponent} from './components/pages/settings/blackbox/keywords/settings.component';
import {KeyBoardComponent} from './components/controls/KeyboardComponent/KeyBoard.Component';
import {VoiceCenterComponent} from './components/pages/logbook/VoiceCenter/VoiceCenter.Component';
import {SystemStateComponent} from './components/pages/home/system-state/system-state.component';
import {AudioRecordScreenComponent} from './components/controls/AudioRecordScreenComponent/AudioRecordScreen.Component';
import {MapComponent} from './components/pages/logbook/map/map.component';
import {InfoCardLogbookComponent} from './components/pages/logbook/infoCard/infoCard.component';
import {StatsCardLogbookComponent} from './components/pages/logbook/statsCard/statsCard.component';
import {ArchiveLogbookComponent} from './components/pages/logbook/archive/archive.component';
import {SocketService} from './service/socket.service';
import {AvNavService} from './service/AvNav.service';
import {AudioRecordService} from './service/audioRecord.service';
import {PreviewRouteComponent} from './components/pages/logbook/previewRoute/previewRoute.component';
import {PreviewRouteService} from './service/previewRoute.service';
import {ConvertingService} from './service/converting.service';
import {CustomButtonComponent} from './components/controls/ButtonComponent/Button.Component';
import {CoreService} from './service/core.service';
import {ConfigurationService} from './service/configuration.service';
import {UnitService} from './service/unit.service';
import {AlarmsComponent} from './components/pages/settings/arlams/alarms.component';
import {NgMultiSelectDropDownModule} from 'ng-multiselect-dropdown';
import {AlarmPopUpComponent} from './components/controls/alarm-popup/AlarmPopUp.component';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {DatetimeService} from './service/datetime.service';
import {QRScannerComponent} from './components/controls/qrscanner/qrscanner.component';
import {QRScannerService} from './service/QRScanner.service';
import {DevicePreviewComponent} from './components/controls/device-preview/device-preview.component';
import {SecurityQueryComponent} from './components/controls/securityQuery/securityQuery.component';
import {SecurityQueryService} from './service/securityQuery.service';
import {BatteryInfoComponent} from './components/controls/battery-info/battery-info.component';
import {MotorInfoComponent} from './components/controls/motor-info/motor-info.component';
import {WindInfoComponent} from './components/controls/wind-info/wind-info.component';
import {ShipInfoComponent} from './components/controls/ship-info/ship-info.component';
import {DeveloperService} from './service/developer.service';
import {ClientSDKModule} from './client-sdk/client-sdk.module';
import {AlertsService} from './service/alerts.service';
import {CloudAuthComponent} from './components/pages/cloud/auth/cloud-auth.component';
import {CloudAccountComponent} from './components/pages/cloud/cloud-account/cloud-account.component';
import {WelcomeComponent} from './components/pages/welcome/welcome.component';
import {LoaderService} from './service/loader.service';
import {
  DatePickerFilterComponent
} from './components/pages/logbook/archive/filters/DatePickerFilterComponent/DatePickerFilter.component';
import {
  DatePickerFilterService
} from './components/pages/logbook/archive/filters/DatePickerFilterComponent/DatePickerFilter.service';
import {ExtractDataService} from './service/extractData.service';
import {DataWidgetComponent} from './components/controls/data-widget/data-widget.component';
import {EditorComponent} from './components/controls/editor/editor.component';
import {EditorService} from './components/controls/editor/editor.service';
import {LogbookEntriesComponent} from './components/pages/logbook/previewRoute/entries/entries.component';
import {LogbookEntriesService} from './components/pages/logbook/previewRoute/entries/entries.service';
import {LockpageComponent} from './components/pages/lockpage/lockpage.component';
import {LockpageService} from './components/pages/lockpage/lockpage.service';
import {BrainService} from './service/brain.service';
import {NavigationPlotterComponent} from './components/pages/navigation-plotter/navigation-plotter.component';
import {NavigationPlotterService} from './components/pages/navigation-plotter/navigation-plotter.service';
import {VdrOverlayComponent} from './components/pages/navigation-plotter/vdr-overlay/vdr-overlay.component';
import {VdrOverlayService} from './components/pages/navigation-plotter/vdr-overlay/vdr-overlay.service';
import {NgBaseService} from "./client-sdk/services/ng-base.service";
import {MqttModule, MqttService, MqttServiceConfig} from "ngx-mqtt";

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    InstrumentsComponent,
    LogbookComponent,
    NavigationComponent,
    ShipComponent,
    VerbraucherComponent,
    WeatherComponent,
    LightsComponent,
    AlertsComponent,
    LoaderComponent,
    ShipImageComponent,
    MonitoringComponent,
    StatsBarComponent,
    FilesComponent,
    CamComponent,
    InfoCardComponent,
    MaschineComponent,
    BatteryComponent,
    UtcClockComponent,
    HeaderComponent,
    ItemCardComponent,
    CustomRecordComponent,
    ColorPickerComponent,
    WidgetWindComponent,
    SvgWindComponent,
    ColorPickerKelvinComponent,
    BrightnessComponent,
    ButtonComponent,
    SettingsMenuComponent,
    ConnectionSettingsComponent,
    ConnectionSettingsCardComponent,
    ConnectionSettingsEditCardComponent,
    PlotterComponent,
    UserSettingsComponent,
    LightSettingsComponent,
    SystemSettingsComponent,
    TemperatureComponent,
    BatteryElementComponent,
    WaterElementComponent,
    CustomSettingsComponent,
    BatteryLargeElementComponent,
    VideoPlayerElementComponent,
    BlackBoxSettingsComponent,
    DatepickerElementComponent,
    BlackBoxKeywordsSettingsComponent,
    KeyBoardComponent,
    VoiceCenterComponent,
    SystemStateComponent,
    AudioRecordScreenComponent,
    MapComponent,
    InfoCardLogbookComponent,
    StatsCardLogbookComponent,
    ArchiveLogbookComponent,
    PreviewRouteComponent,
    CustomButtonComponent,
    AlarmsComponent,
    AlarmPopUpComponent,
    QRScannerComponent,
    DevicePreviewComponent,
    SecurityQueryComponent,
    BatteryInfoComponent,
    MotorInfoComponent,
    WindInfoComponent,
    ShipInfoComponent,
    CloudAuthComponent,
    CloudAccountComponent,
    WelcomeComponent,
    DatePickerFilterComponent,
    DataWidgetComponent,
    EditorComponent,
    LogbookEntriesComponent,
    LockpageComponent,
    NavigationPlotterComponent,
    SvgWindComponent,
    VdrOverlayComponent,
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    ClientSDKModule,
    BrowserModule,
    AppRoutingModule,
    [GaugeModule.forRoot()],
    FormsModule,
    QRCodeModule,
    PdfViewerModule,
    GaugesModule,
    ZXingScannerModule,
    SignalKClientModule,
    NgMultiSelectDropDownModule.forRoot(),
    HammerModule,
    NoopAnimationsModule,
    MatTableModule,
    MqttModule.forRoot({
      hostname: localStorage.getItem('MyShip.ServerUrl') ?? 'localhost',
      port: 8883,
      protocol: 'ws',
    }),
    MatSortModule
  ],
  providers: [
    SocketService,
    SignalKService,
    AvNavService,
    AudioRecordService,
    PreviewRouteService,
    ConvertingService,
    CoreService,
    ConfigurationService,
    UnitService,
    DatetimeService,
    QRScannerService,
    SecurityQueryService,
    DeveloperService,
    AlertsService,
    LoaderService,
    DatePickerFilterService,
    ExtractDataService,
    EditorService,
    LogbookEntriesService,
    LockpageService,
    BrainService,
    NavigationPlotterService,
    VdrOverlayService,
    NgBaseService,
    provideHttpClient(withInterceptorsFromDi())
  ]
})
export class AppModule {
  constructor(private developerService: DeveloperService) {
    //
  }
}
