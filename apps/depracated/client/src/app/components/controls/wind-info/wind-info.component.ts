import {Component, IterableDiffers} from '@angular/core';
import {SignalKService} from '../../../service/SignalK.Service';
import {ConvertingService} from '../../../service/converting.service';
import {ComponentTemplate} from '../../../service/ComponentTemplate';
import {SignalkData} from '../../../client-sdk/models/SignalkData';
import {NightModeService} from "../../../client-sdk/services/nightMode.service";

@Component({
  selector: 'app-wind-info',
  templateUrl: './wind-info.component.html',
  styleUrls: ['./wind-info.component.scss']
})
export class WindInfoComponent extends ComponentTemplate {

  aws = 0;
  awa = 0;
  bft = 0;
  direction = '';

  private iterableDiffer: any;

  constructor(private signalK: SignalKService, differs: IterableDiffers,
              private convert: ConvertingService,
              public nightModeService: NightModeService) {
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
            this.awa = this.round(this.convert.rad2deg(element.getValue()));
            this.direction = this.convert.getCompassDescription(this.awa);
            break;
          case 'environment.wind.speedApparent':
            this.aws = this.round(this.convert.mpsToKnots(element.getValue()));
            this.bft = this.round(this.convert.mpsToBeaufort(element.getValue()));
            break;
        }
      });
    }
  }

}
