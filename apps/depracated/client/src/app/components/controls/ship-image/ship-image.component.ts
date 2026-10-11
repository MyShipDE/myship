import {Component, OnInit} from '@angular/core';
import $ from 'jquery';
import {SocketService} from '../../../service/socket.service';
import {DeviceService} from '../../../client-sdk/services/device.service';
import {Device} from '../../../client-sdk/models/Device';

@Component({
  selector: 'app-ship-image',
  templateUrl: './ship-image.component.html',
  styleUrls: ['./ship-image.component.scss'],
})
export class ShipImageComponent implements OnInit {
  static anchor = false;
  static backboard = false;
  static steuerboard = false;
  static heck = false;
  static dampfer = false;

  interval: any;

  constructor(private service: DeviceService, private websocket: SocketService) {
  }

  async ngOnInit(): Promise<void> {
    let items = this.service.list.filter(x => x.type === 'pos');
    if (items.length > 0) {
      items.forEach((d: Device) => {
        this.setLights(d);
      });
      this.service.listChangeNotifier.subscribe(() => {
        items = this.service.list.filter(x => x.type === 'pos');
        items.forEach((d: Device) => {
          this.setLights(d);
        });
      });
    }
  }

  public setLights(device): void {
    if (device.name === 'POS Segeln') {
      // Positionslichter Segeln
      if (device.isActive) {
        $('.heck').css('fill', '#FFed00');
        $('.backboard').css('fill', '#FF0000');
        $('.steuerboard').css('fill', '#00FF00');
        ShipImageComponent.heck = true;
        ShipImageComponent.steuerboard = true;
        ShipImageComponent.backboard = true;
      } else {
        $('.heck').css('fill', 'transparent');
        $('.backboard').css('fill', 'transparent');
        $('.steuerboard').css('fill', 'transparent');
        ShipImageComponent.heck = false;
        ShipImageComponent.steuerboard = false;
        ShipImageComponent.backboard = false;
      }
    } else if (device.id === 14) {
      // Positionslichter Motor
      if (device.isActive) {
        $('.dampfer').css('fill', '#FFed00');
        ShipImageComponent.dampfer = true;
      } else {
        $('.dampfer').css('fill', 'transparent');
        ShipImageComponent.dampfer = true;
      }
    } else if (device.id === 12) {
      // Positionslichter Anker
      if (device.isActive) {
        $('.anker').css('fill', '#FFed00');
        ShipImageComponent.anchor = true;
      } else {
        $('.anker').css('fill', 'transparent');
        ShipImageComponent.anchor = false;
      }
    }
  }

}
