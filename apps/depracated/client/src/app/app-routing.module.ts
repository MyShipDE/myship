import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './components/pages/home/home.component';
import {NavigationComponent} from './components/pages/position-lights/navigation.component';
import {ShipComponent} from './components/pages/ship/ship.component';
import {VerbraucherComponent} from './components/pages/verbraucher/verbraucher.component';
import {WeatherComponent} from './components/pages/weather/weather.component';
import {LightsComponent} from './components/pages/lights/lights.component';
import {FilesComponent} from './components/pages/files/files.component';
import {CamComponent} from './components/pages/cam/cam.component';
import {MaschineComponent} from './components/pages/instruments/maschine/instruments.component';
import {BatteryComponent} from './components/pages/battery/instruments.component';
import {SettingsMenuComponent} from './components/pages/settings/menu/settings.component';
import {UserSettingsComponent} from './components/pages/settings/users/settings.component';
import {LightSettingsComponent} from './components/pages/settings/lights/settings.component';
import {SystemSettingsComponent} from './components/pages/settings/system/settings.component';
import {TemperatureComponent} from './components/pages/instruments/temperature/instruments.component';
import {CustomSettingsComponent} from './components/pages/settings/custom/CustomSettingsComponent';
import {BlackBoxSettingsComponent} from './components/pages/settings/blackbox/settings.component';
import {BlackBoxKeywordsSettingsComponent} from './components/pages/settings/blackbox/keywords/settings.component';
import {ArchiveLogbookComponent} from './components/pages/logbook/archive/archive.component';
import {AlarmsComponent} from './components/pages/settings/arlams/alarms.component';
import {DevicePreviewComponent} from './components/controls/device-preview/device-preview.component';
import {CloudAuthComponent} from './components/pages/cloud/auth/cloud-auth.component';
import {CloudAccountComponent} from './components/pages/cloud/cloud-account/cloud-account.component';
import {WelcomeComponent} from './components/pages/welcome/welcome.component';
import {LockpageComponent} from './components/pages/lockpage/lockpage.component';
import {NavigationPlotterComponent} from './components/pages/navigation-plotter/navigation-plotter.component';

const routes: Routes = [
  {path: 'home', component: HomeComponent},
  {path: 'lock', component: LockpageComponent},
  {path: 'beleuchtung', component: LightsComponent},
  {path: 'vdr', component: ArchiveLogbookComponent},
  {path: 'logbook', component: ArchiveLogbookComponent},
  {path: 'position-lights', component: NavigationComponent},
  {path: 'settings', component: SettingsMenuComponent},
  {path: 'settings/custom', component: CustomSettingsComponent},
  {path: 'settings/users', component: UserSettingsComponent},
  {path: 'settings/lights', component: LightSettingsComponent},
  {path: 'settings/system', component: SystemSettingsComponent},
  {path: 'settings/blackbox', component: BlackBoxSettingsComponent},
  {path: 'settings/blackbox/keywords', component: BlackBoxKeywordsSettingsComponent},
  {path: 'settings/alarms', component: AlarmsComponent},
  {path: 'ship', component: ShipComponent},
  {path: 'verbraucher', component: VerbraucherComponent},
  {path: 'weather', component: WeatherComponent},
  {path: 'documents', component: FilesComponent},
  {path: 'cam', component: CamComponent},
  {path: 'maschine', component: MaschineComponent},
  {path: 'battery', component: BatteryComponent},
  {path: 'temperature', component: TemperatureComponent},
  {path: 'cloud/auth', component: CloudAuthComponent},
  {path: 'cloud/account', component: CloudAccountComponent},
  {path: 'device/:id', component: DevicePreviewComponent},
  {path: 'plotter', component: NavigationPlotterComponent},
  {path: 'welcome', component: WelcomeComponent},
  {path: '', redirectTo: 'home', pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: false})], // Electron: ', { useHash: true }'
  exports: [RouterModule]
})
export class AppRoutingModule {
}
