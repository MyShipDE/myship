import {Component, OnInit} from '@angular/core';
import {ComponentTemplate} from './service/ComponentTemplate';
import {SocketService} from './service/socket.service';
import {AlertsService, AlertState} from './service/alerts.service';
import {CoreService} from './service/core.service';
import {Router} from '@angular/router';
import {NightModeService} from './client-sdk/services/nightMode.service';
import {LoaderService} from './service/loader.service';
import {LockpageService} from './components/pages/lockpage/lockpage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})

export class AppComponent extends ComponentTemplate implements OnInit {

  connected = false;

  ShowVoiceCenter = false;

  constructor(private websocket: SocketService,
              public coreService: CoreService,
              private alertService: AlertsService,
              private core: CoreService,
              private router: Router,
              private nightModeService: NightModeService,
              private loader: LoaderService,
              private lockService: LockpageService) {
    super();
  }

  async ngOnInit(): Promise<void> {

    this.loader.startLoading();

    if (await this.coreService.isConnectedAndAuthorized()) {
      this.connected = true;
      this.nightModeService.status = await this.nightModeService.getState();

      const autoLock = localStorage.getItem('MyShip.AutoLock');

      if (autoLock != null && autoLock === '1') {
        await this.router.navigate(['/lock']);
      } else {
        // await this.router.navigate(['/home']);
      }
    } else {
      await this.router.navigate(['/welcome']);
    }

    this.coreService.ConnectionChangesSubject.subscribe(async (state) => {
      if (state) {
        this.connected = true;
        this.nightModeService.status = await this.nightModeService.getState();
        // this.alertService.alert(AlertState.Success, 'Verbindung zum Server hergestellt!');
      } else {
        // this.alertService.alert(AlertState.Error, 'Verbindung zum Server verloren!');
      }
    });

    console.log(`Der Nachtmodus ist ${this.nightModeService.status ? 'aktiviert' : 'deaktiviert'}`);

    this.loader.stopLoading();
  }

  listenWebSocket(): void {
    this.websocket.client.on('vdr.whisper.active', () => {
      this.alertService.alert(AlertState.Info, 'Die Auswertung der Sprachaufzeichnung wurde gestartet!');
    });
  }

}

// <key>NSCameraUsageDescription</key>
// <string>To be able to scan barcodes</string>
