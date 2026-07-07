import {Component, OnInit, IterableDiffers} from '@angular/core';
import {ComponentTemplate} from '../../../service/ComponentTemplate';
import {SignalKService} from '../../../service/SignalK.Service';
import * as $ from 'jquery';
import {ConvertingService} from '../../../service/converting.service';
import {SignalkData} from '../../../client-sdk/models/SignalkData';

@Component({
  selector: 'app-widget-wind',
  templateUrl: './widget-wind.component.html',
  styleUrls: ['./widget-wind.component.scss']
})
export class WidgetWindComponent extends ComponentTemplate {

  private iterableDiffer: any;

  currentHeading = 0;
  appWindAngle: number = null;
  appWindSpeed: number = null;
  trueWindAngle: number = null;
  trueWindSpeed: number = null;
  speedOverGround: number = null;

  trueWindHistoric: {
    timestamp: number;
    heading: number;
  }[] = [];
  trueWindMinHistoric: number;
  trueWindMidHistoric: number;
  trueWindMaxHistoric: number;

  constructor(private signalK: SignalKService, differs: IterableDiffers,
              private convert: ConvertingService) {
    super();
    this.iterableDiffer = differs.find([]).create(null);
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngDoCheck(): void {
    const changes = this.iterableDiffer.diff(this.signalK.dataList);
    if (changes) {
      this.signalK.dataList.forEach((element: SignalkData) => {
        switch (element.getDesc()) {
          case 'environment.wind.angleApparent':
            this.appWindAngle = this.rad2deg(element.getValue());
            break;
          case 'environment.wind.speedApparent':
            this.appWindSpeed = Math.round((element.getValue() * 1.944) * 10) / 10;
            break;
          case 'navigation.speedOverGround':
            this.speedOverGround = Math.round((element.getValue() * 1.944) * 10) / 10;
            break;
          case 'navigation.headingMagnetic':
            if (this.speedOverGround <= 0) {
              this.currentHeading = +this.convert.rad2deg(element.getValue()).toFixed();
            }
            break;
          case 'navigation.courseOverGroundTrue':
            if (this.speedOverGround > 0) {
              this.currentHeading = +this.convert.rad2deg(element.getValue()).toFixed();
            }
            break;
        }
      });
    }

    if (this.speedOverGround != null && this.appWindSpeed) {
      this.trueWindSpeed = this.appWindSpeed - this.speedOverGround;
    }

    if (this.currentHeading != null && this.appWindAngle) {
      this.trueWindAngle = this.appWindAngle - this.currentHeading;
    }
  }

  rad2deg(rad: number): number {
    return rad * 180 / Math.PI;
  }

}
