import {AfterViewInit, Component} from '@angular/core';
import {QRScannerService} from '../../../service/QRScanner.service';
// import {BarcodeScanner} from '@capacitor-community/barcode-scanner';
import {Router} from '@angular/router';
import {DeviceService} from '../../../client-sdk/services/device.service';
import {AlertsService, AlertState} from '../../../client-sdk/services/alerts.service';

@Component({
  selector: 'app-qrScanner',
  templateUrl: './qrscanner.component.html',
  styleUrls: ['./qrscanner.component.scss']
})
export class QRScannerComponent implements AfterViewInit {

  constructor(public service: QRScannerService,
              private deviceService: DeviceService,
              private alertService: AlertsService,
              private router: Router) {
  }

  async ngAfterViewInit(): Promise<void> {
    /* try {
      const status = await BarcodeScanner.checkPermission({force: true});
      if (status.granted) {
        const result = await BarcodeScanner.startScan(); // start scanning and wait for a result

        if (result.hasContent) {

          if (result.content.startsWith('MyShip.Device.QR')) {
            const content = result.content.split('#');

            if (content.length !== 2) {
              this.alertService.alert(AlertState.Error, 'Der QR-Code kann nicht gelesen werden!');
              await this.dispose();
              return;
            }

            this.service.identifier = content[1];
            await this.router.navigate(['/device/' + this.service.identifier]);
          }

        }

      }
    } catch (e) {
      this.alertService.alert(AlertState.Error, 'Es ist ein Fehler beim Scannen des QR-Codes aufgetreten!');
      await this.dispose();
    } */
  }

  async dispose(): Promise<void> {
    await this.router.navigate(['/settings/system']);
  }

}
