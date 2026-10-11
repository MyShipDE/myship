import {Component, IterableDiffers} from '@angular/core';
import {SignalKService} from '../../../../service/SignalK.Service';
import {SignalkData} from '../../../../client-sdk/models/SignalkData';

@Component({
  selector: 'app-maschine',
  templateUrl: './instruments.component.html',
  styleUrls: ['./instruments.component.scss'],
})
export class MaschineComponent {
  public lat: string;
  public lon: string;
  public satellite: number;
  public sog: number;
  public cog: number;
  public deep: number;
  public wsa: number;

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
          case 'environment.depth.belowKeel':
            this.deep = Math.round(element.getValue() * 10) / 10;
            break;
          case 'environment.wind.speedApparent':
            this.wsa = Math.round((element.getValue() * 1.944) * 10) / 10;
            break;
        }
      });
    }
  }

  getLabel(value): number {
    return Math.round(value * 100) / 100;
  }
}
