import {Component, IterableDiffers, OnInit} from '@angular/core';
import {SignalKService} from '../../../service/SignalK.Service';
import {SignalkData} from '../../../client-sdk/models/SignalkData';

@Component({
  selector: 'app-ship',
  templateUrl: './ship.component.html',
  styleUrls: ['./ship.component.scss'],
})
export class ShipComponent {
  public lat: string;
  public lon: string;
  public sog: number;
  public cog: number;

  private iterableDiffer: any;

  constructor(private signalK: SignalKService, differs: IterableDiffers) {
    this.iterableDiffer = differs.find([]).create(null);
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngDoCheck(): void {
    const changes = this.iterableDiffer.diff(this.signalK.dataList);
    if (changes) {
      this.signalK.dataList.forEach((element: SignalkData) => {
        switch (element.getDesc()) {
          case 'position-lights.position':
            this.lon = element.formatCords()[0];
            this.lat = element.formatCords()[1];
            break;
          case 'position-lights.speedOverGround':
            this.sog = Math.round((element.getValue() * 1.944) * 10) / 10;
            break;
          case 'position-lights.courseOverGroundTrue':
            this.cog = (Math.round((element.getValue() * (180 / Math.PI))));
            break;
        }
      });
    }
  }
}
