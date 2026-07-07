import {Component, IterableDiffers} from '@angular/core';
import {SignalKService} from '../../../service/SignalK.Service';
import {ConvertingService} from '../../../service/converting.service';
import {ComponentTemplate} from '../../../service/ComponentTemplate';
import {SignalkData} from '../../../client-sdk/models/SignalkData';
import {NightModeService} from "../../../client-sdk/services/nightMode.service";

@Component({
  selector: 'app-ship-info',
  templateUrl: './ship-info.component.html',
  styleUrls: ['./ship-info.component.scss']
})
export class ShipInfoComponent extends ComponentTemplate {

  lat = '';
  lon = '';
  sog = 0;
  cog = 0;

  private iterableDiffer: any;

  constructor(private signalK: SignalKService, differs: IterableDiffers,
              private convert: ConvertingService, public nightModeService: NightModeService) {
    super();
    this.iterableDiffer = differs.find([]).create(null);
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngDoCheck(): void {
    const changes = this.iterableDiffer.diff(this.signalK.dataList);
    if (changes) {
      this.signalK.dataList.forEach((element: SignalkData) => {
        switch (element.getDesc()) {
          case 'position-lights.position':
            this.lon = this.convert.convertToDegreeMinutes(element.getValue().longitude, false);
            this.lat = this.convert.convertToDegreeMinutes(element.getValue().latitude, true);
            break;
          case 'position-lights.speedOverGround':
            this.sog = this.round(this.convert.mpsToKnots(element.getValue()));
            break;
          case 'position-lights.courseOverGroundTrue':
            this.cog = this.round(this.convert.rad2deg(element.getValue()));
            break;
        }
      });
    }
  }

}
