import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ComponentTemplate} from '../../../../service/ComponentTemplate';
import {StringHelper} from '../../../../service/StringHelper';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
// import {BarcodeScanner} from '@capacitor-community/barcode-scanner';
import {Client} from '../../../../client-sdk/models/Client';
import {HttpService} from '../../../../client-sdk/services/http.service';
import {LoaderService} from '../../../../service/loader.service';

@Component({
  selector: 'app-settings-connections',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})

export class UserSettingsComponent extends ComponentTemplate implements OnInit {

  users: Array<Client> = new Array<Client>();
  client: Client;

  server: string = localStorage.getItem('MyShip.ServerUrl');

  comment = '';
  adminAccess = '0';

  qrScanner = false;
  qrScanFailed = false;

  constructor(private router: Router, private http: HttpClient, private httpService: HttpService,
              private loader: LoaderService) {
    super();
  }

  async ngOnInit(): Promise<void> {
    this.loader.startLoading();
    await this.loadClients();
    this.loader.stopLoading();
  }

  loadClients(): Promise<void> {
    return new Promise(resolve => {
      this.http
        .get(this.httpService.api + '/clients', this.httpService.options)
        .subscribe((clients: Array<Client>) => {
          this.users = clients;
          resolve();
        }, (err: HttpErrorResponse) => {
          // CloudComponent.alert('error', 'Die Liste der Benutzer konnte nicht abgerufen werden. (Fehlercode: ' + err.status + ')');
          this.router.navigate(['settings']);
          resolve();
        });
    });
  }

  delete(id: number): void {
    this.http
      .delete(this.httpService.api + '/client/' + id, this.httpService.options)
      .subscribe((clients: any) => {
        this.loadClients();
        // CloudComponent.alert('success', 'Der Benutzer wurde erfolgreich gelöscht!');
      });
  }

  create(): void {
    let admin = null;
    if (this.adminAccess === '1') {
      admin = '1';
    }
    this.http
      .post(this.httpService.api + '/client', {
        token: StringHelper.random(12),
        comment: this.comment,
        isAdmin: admin
      }, this.httpService.options)
      .subscribe(() => {
        this.loadClients();
        // CloudComponent.alert('success', 'Der Benutzer wurde erfolgreich erstellt!');
        this.comment = '';
        this.adminAccess = '0';
      });
  }

  isIdentifierSame(identifier: string): boolean {
    return false;
  }

  async grantAccessViaQR(authorizationToken: string): Promise<void> {
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
              case 'MyShip;ForeignAuthorizationQR':
                const uuid = value[1];

                this.loader.startLoading();

                this.http.post(this.httpService.api + '/login', {
                  token: authorizationToken
                }, {
                  headers: new HttpHeaders({
                    Authorization: uuid
                  })
                }).subscribe(() => {
                  this.loadClients();
                  this.loader.stopLoading();
                  // CloudComponent.alert('success', 'Der Vorgang war erfolgreich!');
                }, error => {
                  this.loader.stopLoading();
                  // CloudComponent.alert('error', 'Es ist ein Fehler aufgetreten!');
                });

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
      //
    }
  }

}

