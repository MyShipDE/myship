import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import * as $ from 'jquery';
import {DeviceService} from '../../../client-sdk/services/device.service';
import {LightService} from '../../../client-sdk/services/light.service';
import {HttpService} from '../../../client-sdk/services/http.service';
import {LightGroup} from '../../../client-sdk/models/LightGroup';
import {LightGroupService} from '../../../client-sdk/services/lightGroup.service';
import {Device} from '../../../client-sdk/models/Device';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-monitoring',
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.scss'],
})

export class MonitoringComponent implements AfterViewInit {

  @Input()
  Visibility = false;
  @Input()
  OpenSubject: Subject<void> = new Subject<void>();

  @Output()
  CloseEvent: EventEmitter<void> = new EventEmitter<void>();

  lightGroups: LightGroup[] = [];
  spots: Device[] = [];
  devices: Device[] = [];

  lightGroupToDelete: number[] = [];
  devicesToDelete: number[] = [];

  loader = false;

  constructor(private deviceService: DeviceService,
              private lightGroupService: LightGroupService,
              private httpService: HttpService) {
  }

  async ngAfterViewInit(): Promise<void> {
    this.OpenSubject.subscribe(async () => {
      this.loader = true;

      this.lightGroups = [];
      this.spots = [];
      this.devices = [];

      await this.lightGroupService.load();
      await this.deviceService.load();

      this.lightGroups = this.lightGroupService.list.filter(x => x.isActive);
      this.spots = this.deviceService.list.filter(x => x.type === 'light' && x.isActive);
      this.devices = this.deviceService.list.filter(x => (x.type === 'ver' || x.type === 'nav') && x.isActive);

      this.loader = false;
    });
  }

  selectLightGroup(id: number): void {
    if (this.lightGroupToDelete.includes(id)) {
      this.lightGroupToDelete.splice(this.lightGroupToDelete.indexOf(id), 1);
    } else {
      this.lightGroupToDelete.push(id);
    }
  }

  isLightGroupSelected(id: number): boolean {
    return this.lightGroupToDelete.includes(id);
  }

  selectDevice(id: number): void {
    if (this.devicesToDelete.includes(id)) {
      this.devicesToDelete.splice(this.devicesToDelete.indexOf(id), 1);
    } else {
      this.devicesToDelete.push(id);
    }
  }

  isDeviceSelected(id: number): boolean {
    return this.devicesToDelete.includes(id);
  }

  async CheckOut(): Promise<void> {
    this.loader = true;

    for (const id of this.lightGroupToDelete) {
      const lightGroup = this.lightGroups.find(x => x.id === id);

      if (lightGroup.isActive) {
        await this.lightGroupService.control(lightGroup);
      }

    }

    for (const id of this.devicesToDelete) {
      let device = this.devices.find(x => x.id === id);
      if (device == null) {
        device = this.spots.find(x => x.id === id);
      }

      if (device.isActive) {
        await this.deviceService.control(device);
      }

    }

    this.Close();

    this.loader = false;
  }

  CanCheckOut(): boolean {
    return this.lightGroupToDelete.length > 0 || this.devicesToDelete.length > 0;
  }

  Close(): void {
    this.CloseEvent.emit();
  }

}
