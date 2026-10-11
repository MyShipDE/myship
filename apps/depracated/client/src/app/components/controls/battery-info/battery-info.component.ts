import {Component, IterableDiffers} from '@angular/core';
import {SignalKService} from '../../../service/SignalK.Service';
import {SignalkData} from '../../../client-sdk/models/SignalkData';
import {ComponentTemplate} from '../../../service/ComponentTemplate';
import {ConvertingService} from '../../../service/converting.service';
import {NightModeService} from "../../../client-sdk/services/nightMode.service";

@Component({
  selector: 'app-battery-info',
  templateUrl: './battery-info.component.html',
  styleUrls: ['./battery-info.component.scss']
})
export class BatteryInfoComponent extends ComponentTemplate {

  voltage = 0;
  current = 0;
  state = 0;
  power = 0;
  timeRemaining = '';

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
          case 'electrical.batteries.main.voltage':
            this.voltage = this.round(element.getValue());
            if (this.voltage !== 0 && this.current !== 0) {
              this.power = this.round(this.voltage * this.current);
            }
            break;
          case 'electrical.batteries.main.current':
            this.current = this.round(element.getValue());
            if (this.voltage !== 0 && this.current !== 0) {
              this.power = this.round(this.voltage * this.current);
            }
            break;
          case 'electrical.batteries.main.capacity.stateOfCharge':
            this.state = this.round(element.getValue() * 100);
            break;
          case 'electrical.batteries.main.capacity.timeRemaining':
            if (element.getValue() === -60) {
              this.timeRemaining = 'unbegrenzt';
            } else {
              this.timeRemaining = this.convert.secondsToDHMS(element.getValue());
            }
            break;
        }
      });
    }
  }

}
