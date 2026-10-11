import {Component, OnInit} from '@angular/core';
import {QRScannerService} from '../../../service/QRScanner.service';
import {AlertsService, AlertState} from '../../../service/alerts.service';
import {DeviceService} from '../../../client-sdk/services/device.service';
import {Device} from '../../../client-sdk/models/Device';
import {Bridge} from '../../../client-sdk/models/Bridge';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-device-preview',
  templateUrl: './device-preview.component.html',
  styleUrls: ['./device-preview.component.scss']
})
export class DevicePreviewComponent implements OnInit {

  device: Device;
  bridges: Bridge[];

  private sub: any;

  constructor(public service: QRScannerService,
              public deviceService: DeviceService,
              private alertService: AlertsService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  async ngOnInit(): Promise<void> {

    this.sub = this.route.params.subscribe(async (params) => {
      const id: string = params.id;

      this.bridges = await this.deviceService.GetBridges();

      if (this.service.identifier == null) {
        await this.router.navigate(['/verbraucher']);
        return;
      }

      await this.deviceService.load();
      this.device = this.deviceService.list.find(x => x.identifier === id);

      if (this.device == null) {
        await this.router.navigate(['/verbraucher']);
        this.alertService.alert(AlertState.Error, 'Der Verbraucher wurde im System nicht gefunden.');
      }
    });

  }

  getBridgeName(id: number): string {
    const bridge = this.bridges.find(x => x.id === id);
    return bridge == null ? '' : bridge.name;
  }

  async dispose(): Promise<void> {
    await this.router.navigate(['/verbraucher']);
  }

  getType(type: string): string {
    switch (type) {
      case 'ver':
        return 'Verbraucher';
      case 'nav':
        return 'Navigations-Instrument';
      case 'light':
        return 'Licht';
      default:
        return '';
    }
  }

}
