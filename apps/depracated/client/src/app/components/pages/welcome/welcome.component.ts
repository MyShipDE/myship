import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../../client-sdk/services/http.service';
import {AuthService} from '../../../client-sdk/services/auth.service';
import {ConfigurationService} from '../../../service/configuration.service';
import {StatusBar, Style} from '@capacitor/status-bar';
import {CoreService} from '../../../service/core.service';
import {Router} from '@angular/router';
import {LoaderService} from '../../../service/loader.service';
import {Resource} from '../../../Resource';
import {ScreenOrientation} from '@capacitor/screen-orientation';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {

  alertTitle = '';
  alertMessage = '';

  alertConfigTitle = '';
  alertConfigMessage = '';

  AuthorizationQrCode: string = null;

  connected = false;
  authenticated = false;
  configured = false;

  configurationPage = false;
  qrScanner = false;
  qrScanFailed = false;

  inputKey = '';
  server = '';

  constructor(private httpService: HttpService,
              private authService: AuthService,
              private configurationService: ConfigurationService,
              private coreService: CoreService,
              private router: Router,
              private loader: LoaderService) {
    //
  }

  async ngOnInit(): Promise<void> {

    try {
      await ScreenOrientation.lock({orientation: 'portrait'});
    } catch (e) {
      //
    }

    this.connected = false;
    this.authenticated = false;
    this.configured = false;

    this.alertTitle = "Willkommen bei MyShip";
    this.alertMessage = Resource.AppConfigurationRequired;

    this.alertConfigTitle = Resource.WelcomePageConfigurationTitle;
    this.alertConfigMessage = Resource.WelcomePageConfigurationMessage;

    try {
      await StatusBar.setStyle({style: Style.Dark});
    } catch (e) {
      // Ignore
    }

    if (localStorage.getItem('MyShip.ServerUrl') != null) {
      this.configured = true;
      this.server = localStorage.getItem('MyShip.ServerUrl');
      await this.testConnection();
    } else {
      this.connected = await this.configurationService.tryConnect('127.0.0.1');
      if (this.connected) {
        localStorage.setItem('MyShip.ServerUrl', '127.0.0.1');
        this.configured = true;
        await this.checkAuth();
        this.coreService.ConnectionChangesSubject.next(true);
      }
    }

  }

  async testConnection(): Promise<boolean> {
    this.loader.startLoading();
    this.connected = await this.configurationService.tryConnect(this.server);
    if (this.connected) {
      this.alertMessage = Resource.AuthenticationRequired;
      await this.checkAuth();
      return true;
    } else {
      this.alertMessage = Resource.ConnectionFailed;
      this.loader.stopLoading();
      return false;
    }
  }

  async submit(ipAddress: string = null): Promise<void> {
    this.loader.startLoading();

    if (ipAddress != null) {
      this.server = ipAddress;
    }

    localStorage.setItem('MyShip.ServerUrl', this.server);
    this.httpService.setApi();
    this.configured = true;

    this.configurationPage = false;

    if (await this.testConnection()) {
      if (await this.authService.auth(this.inputKey)) {
        this.alertMessage = Resource.AuthenticationRequired;
        await this.checkAuth();
      }
    }

    this.loader.stopLoading();
  }

  async checkAuth(): Promise<void> {
    this.authenticated = await this.authService.checkAuth();
    if (this.authenticated) {
      this.coreService.ConnectionChangesSubject.next(true);
      this.loader.stopLoading()
      await this.router.navigate(['/home']);
    } else {
      this.alertMessage = Resource.AuthenticationRequired;
      this.loader.stopLoading()
    }
  }

  async startScan(): Promise<void> {
    this.loader.startLoading();

    /* const cameraPreviewOptions: CameraPreviewOptions = {
      position: 'rear',
      disableAudio: true,
      height: 350,
      width: screen.width
    }; */

    /* try {
      await CameraPreview.start(cameraPreviewOptions);
      await CameraPreview.stop();

      setTimeout(async () => {
        await CameraPreview.start(cameraPreviewOptions);
        LoaderComponent.stopLoading();
      }, 2000);
    } catch (e) {
      //
    } */

    this.qrScanner = true;
    this.qrScanFailed = false;

    /* try {
      const status = await BarcodeScanner.checkPermission({force: true});
      if (status.granted) {
        const result = await BarcodeScanner.startScan(); // start scanning and wait for a result
        await this.stopScan();

        if (result.hasContent) {
          await this.stopScan();
          const value = result.content.split(';');

          if (value.length === 2) {
            switch (value[0]) {
              case 'MyShip.ExpressSetup':
                const data = value[1].split('#');
                if (data.length === 2) {
                  const inputServer = data[0];
                  this.inputKey = data[1];

                  if (await this.configurationService.tryConnect(inputServer)) {
                    this.server = inputServer;
                    localStorage.setItem('MyShip.ServerUrl', inputServer);
                    this.connected = true;
                    this.manualInput = false;

                    if (await this.authService.auth(this.inputKey)) {
                      // CloudComponent.alert('success', 'Authentifizierung war erfolgreich!');
                      this.authenticated = true;
                      this.manualAuthInput = false;
                    } else {
                      // CloudComponent.alert('error', 'Authentifizierung ist fehlgeschlagen!');
                      this.authenticated = false;
                    }

                  } else {
                    this.connected = false;
                  }
                } else {
                  // CloudComponent.alert('error', 'Dies ist kein gültiger QR-Code, welcher mit dieser App verwendet werden kann!', 6000);
                }
                break;
              default:
                // CloudComponent.alert('error', 'Dies ist kein gültiger QR-Code, welcher mit dieser App verwendet werden kann!', 6000);
                break;
            }
          } else {
            // CloudComponent.alert('error', 'Dies ist kein gültiger QR-Code, welcher mit dieser App verwendet werden kann!', 6000);
          }
        }

      }
    } catch (e) {
      this.qrScanner = false;
      this.qrScanFailed = true;
      this.loader.stopLoading();
      console.log('Catch Error at StartScan-Function');
    } */

  }

  async stopScan(): Promise<void> {
    this.qrScanner = false;
    try {
      // await BarcodeScanner.stopScan();
    } catch (e) {
      console.log('Catch Error at StopScan-Function');
    } finally {
      this.loader.stopLoading();
    }
  }

  async reset(): Promise<void> {
    localStorage.clear();
    await this.ngOnInit();
  }

}
