import {Component, IterableDiffers} from '@angular/core';
import {SignalkData} from '../../../../client-sdk/models/SignalkData';
import {SignalKService} from '../../../../service/SignalK.Service';
import {NightModeService} from '../../../../client-sdk/services/nightMode.service';
import * as moment from 'moment';
import {ConvertingService} from '../../../../service/converting.service';

@Component({
  selector: 'app-utc-clock',
  templateUrl: './utc-clock.component.html',
  styleUrls: ['utc-clock.component.scss']
})

export class UtcClockComponent {

  datetime: string = new Date().toString();

  currentTime: string = null;
  currentDate: string = null;

  utcSwitchIcons = false;
  utc = 0;

  private iterableDiffer: any;

  constructor(private signalK: SignalKService, differs: IterableDiffers, private convert: ConvertingService, public nightModeService: NightModeService) {
    this.utc = +localStorage.getItem('utc');
    this.iterableDiffer = differs.find([]).create(null);
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngDoCheck(): void {
    const changes = this.iterableDiffer.diff(this.signalK.dataList);
    if (changes) {
      this.signalK.dataList.forEach((element: SignalkData) => {
        switch (element.getDesc()) {
          case 'navigation.datetime':
            this.datetime = element.getValue();
            this.setTime();
            break;
        }
      });
    }
  }

  setTime(): void {
    const utcZeit = moment.utc(this.datetime); // UTC-Zeit definieren
    const calcTime = utcZeit.utcOffset(this.utc * 60); // Zeitzonenverschiebung anwenden

    this.currentTime = `${calcTime.hours() < 10 ? '0' : ''}${calcTime.hours()}:${calcTime.minutes() < 10 ? '0' : ''}${calcTime.minutes()}`;
    this.currentDate = `${calcTime.date() < 10 ? '0' : ''}${calcTime.date()}.${calcTime.month() + 1 < 10 ? '0' : ''}${calcTime.month() + 1}.${calcTime.year()}`;
  }

  convertIntToString(value: number): string {
    return value < 10 ? '0' + value : value.toString();
  }

}
