import {Component, OnInit} from '@angular/core';
import {DeviceService} from '../../../client-sdk/services/device.service';
import {SocketService} from '../../../service/socket.service';
import {HttpService} from '../../../client-sdk/services/http.service';
import {Device} from '../../../client-sdk/models/Device';
import {SocketChannel} from '../../../client-sdk/resources/SocketChannel';

@Component({
  selector: 'app-position-lights',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})

export class NavigationComponent implements OnInit {

  sailingBtnBg = '';
  motorBtnBg = '';
  anchorBtnBg = '';
  offBtnBg = '';

  constructor(private service: DeviceService, private socket: SocketService, private httpService: HttpService) {
  }

  async ngOnInit(): Promise<void> {
    await this.service.load();
    await this.refreshState();

    this.service.listChangeNotifier.subscribe(() => {
      this.refreshState();
    });

  }

  get devices(): Array<Device> {
    return this.service.list.filter(x => x.type === 'pos');
  }

  async refreshState(): Promise<void> {
    this.sailingBtnBg = '';
    this.motorBtnBg = '';
    this.anchorBtnBg = '';
    this.offBtnBg = '';

    if (this.devices.find(x => x.name === 'POS Segeln').isActive) {
      this.sailingBtnBg = 'bg-primary';
    }
    if (this.devices.find(x => x.name === 'POS Maschine').isActive) {
      this.motorBtnBg = 'bg-primary';
    }
    if (this.devices.find(x => x.name === 'Ankerlicht').isActive) {
      this.anchorBtnBg = 'bg-primary';
    }
    if (this.devices.find(x => x.isActive) == null) {
      this.offBtnBg = 'bg-primary';
    }
  }

  async powerOff(): Promise<void> {
    if (this.devices.find(x => x.name === 'POS Segeln').isActive) {
      const d = this.devices.find(x => x.name === 'POS Segeln');
      await this.service.control(d);
    }
    if (this.devices.find(x => x.name === 'POS Maschine').isActive) {
      const d = this.devices.find(x => x.name === 'POS Maschine');
      await this.service.control(d);
    }
    if (this.devices.find(x => x.name === 'Ankerlicht').isActive) {
      const d = this.devices.find(x => x.name === 'Ankerlicht');
      await this.service.control(d);
    }
    await this.refreshState();
  }

  async sailing(): Promise<void> {
    if (!this.devices.find(x => x.name === 'POS Segeln').isActive) {
      const d = this.devices.find(x => x.name === 'POS Segeln');
      await this.service.control(d);
    }
    if (this.devices.find(x => x.name === 'POS Maschine').isActive) {
      const d = this.devices.find(x => x.name === 'POS Maschine');
      await this.service.control(d);
    }
    if (this.devices.find(x => x.name === 'Ankerlicht').isActive) {
      const d = this.devices.find(x => x.name === 'Ankerlicht');
      await this.service.control(d);
    }
    await this.refreshState();
  }

  async motor(): Promise<void> {
    if (this.devices.find(x => x.name === 'POS Maschine').bridgePort == null) {
      // TODO Alert
      return;
    }
    if (!this.devices.find(x => x.name === 'POS Segeln').isActive) {
      const d = this.devices.find(x => x.name === 'POS Segeln');
      await this.service.control(d);
    }
    if (!this.devices.find(x => x.name === 'POS Maschine').isActive) {
      const d = this.devices.find(x => x.name === 'POS Maschine');
      await this.service.control(d);
    }
    if (this.devices.find(x => x.name === 'Ankerlicht').isActive) {
      const d = this.devices.find(x => x.name === 'Ankerlicht');
      await this.service.control(d);
    }
    await this.refreshState();
  }

  async anchor(): Promise<void> {
    if (this.devices.find(x => x.name === 'Ankerlicht').bridgePort == null) {
      // TODO Alert
      return;
    }
    if (this.devices.find(x => x.name === 'POS Segeln').isActive) {
      const d = this.devices.find(x => x.name === 'POS Segeln');
      await this.service.control(d);
    }
    if (this.devices.find(x => x.name === 'POS Maschine').isActive) {
      const d = this.devices.find(x => x.name === 'POS Maschine');
      await this.service.control(d);
    }
    if (!this.devices.find(x => x.name === 'Ankerlicht').isActive) {
      const d = this.devices.find(x => x.name === 'Ankerlicht');
      await this.service.control(d);
    }
    await this.refreshState();
  }

}
