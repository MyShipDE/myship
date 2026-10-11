import {Component, OnInit} from '@angular/core';
import {DatePickerFilterService} from './DatePickerFilter.service';
import {TrackService} from '../../../../../../client-sdk/services/track.service';

@Component({
  selector: 'app-logbook-archive-filter-datepicker',
  templateUrl: './DatePickerFilter.component.html',
  styleUrls: ['./DatePickerFilter.component.scss']
})
export class DatePickerFilterComponent implements OnInit {

  days: Date[] = [];

  constructor(public service: DatePickerFilterService,
              private trackService: TrackService) {
    //
  }

  async ngOnInit(): Promise<void> {
    this.days = await this.trackService.getDates();
  }

  dateSelected(date: string): void {
    console.log(date);
  }

}
