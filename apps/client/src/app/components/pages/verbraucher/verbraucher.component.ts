import {Component, OnInit} from '@angular/core';
import {AlertsService, AlertState} from '../../../service/alerts.service';
import {QRScannerService} from '../../../service/QRScanner.service';
import {Router} from '@angular/router';
import {Bridge} from '../../../client-sdk/models/Bridge';
import {Device} from '../../../client-sdk/models/Device';
import {DeviceService} from '../../../client-sdk/services/device.service';
import {LoaderService} from '../../../service/loader.service';

@Component({
  selector: 'app-verbraucher',
  templateUrl: './verbraucher.component.html',
  styleUrls: ['./verbraucher.component.scss'],
})
export class VerbraucherComponent implements OnInit {

  filterCheckBoxVisibility = false;
  bridges: Bridge[];
  devices: Device[];

  selectedListIndex = '1';

  selectedDevice: Device;
  creationModal = false;

  navSelected = false;

  verBg = 'bg-primary';
  navBg = '';

  constructor(public service: DeviceService, private alert: AlertsService, public qrService: QRScannerService,
              private router: Router, private loader: LoaderService) {
    //
  }

  async ngOnInit(): Promise<void> {
    this.loader.startLoading();
    await this.service.load();
    this.bridges = await this.service.GetBridges();
    this.setDeviceList();

    this.service.listChangeNotifier.subscribe(() => {
      this.setDeviceList();
    });

    this.loader.stopLoading();
  }

  setDeviceList(): void {
    switch (this.selectedListIndex) {
      case '1':
        this.devices = this.service.list.filter(x => x.type === 'ver');
        break;
      case '2':
        this.devices = this.service.list.filter(x => x.type === 'nav');
        break;
      case '3':
        this.devices = this.service.list.filter(x => x.type === 'light');
        break;
      case '4':
        this.devices = this.service.list;
        break;
    }
  }

  async saveDevice(): Promise<void> {
    if (await this.service.Put(this.selectedDevice)) {
      this.alert.alert(AlertState.Success, 'Die Änderungen wurden gespeichert.');
    } else {
      this.alert.alert(AlertState.Error, 'Die Änderungen konnten nicht gespeichert werden.');
    }
  }

  async deleteDevice(device: Device): Promise<void> {
    if (await this.service.Delete(this.selectedDevice)) {
      this.alert.alert(AlertState.Success, 'Der Verbraucher wurde gelöscht.');
      this.creationModal = false;
      this.service.list = this.service.list.filter(x => x.id !== this.selectedDevice.id);
      this.selectedDevice = null;
      this.setDeviceList();
    } else {
      this.alert.alert(AlertState.Error, 'Der Vorgang konnte nicht abgeschlossen werden.');
    }
  }

  copyMessage(val: string): void {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this.alert.alert(AlertState.Success, 'Der QR-Code Inhalt wurde in die Zwischenablage kopiert.');
  }

  openCreationForm(): void {
    this.selectedDevice = new Device();
    this.creationModal = true;
  }

  async openScanner(): Promise<void> {
    await this.router.navigate(['/scanner']);
  }

}
