import {Component, IterableDiffers} from '@angular/core';
import convertGrade from 'convert-grades';
import {SignalKService} from '../../../../service/SignalK.Service';
import {SignalkData} from '../../../../client-sdk/models/SignalkData';

@Component({
  selector: 'app-temperature',
  templateUrl: './instruments.component.html',
  styleUrls: ['./instruments.component.scss'],
})
export class TemperatureComponent {

  public inside: number;
  public outside: number;
  public motorRoom: number;
  public motorWater: number;

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
          case 'environment.outside.temperature':
            this.outside = this.round(this.calcCelsius(element.getValue()));
            break;
          case 'environment.inside.temperature':
            this.inside = this.round(this.calcCelsius(element.getValue()));
            break;
          case 'environment.inside.heating.temperature':
            this.motorWater = this.round(this.calcCelsius(element.getValue()));
            break;
          case 'environment.inside.engineRoom.temperature':
            this.motorRoom = this.round(this.calcCelsius(element.getValue()));
            break;
        }
      });
    }
  }

  round(x: number): number {
    return Math.round(x * 10) / 10;
  }

  calcCelsius(x: number): number {
    return convertGrade(x, 'k', 'c');
  }
}
