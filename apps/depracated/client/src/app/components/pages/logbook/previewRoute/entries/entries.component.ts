import {Component, Input, OnInit} from '@angular/core';
import {LogbookEntriesService} from './entries.service';
import {VdrService} from '../../../../../client-sdk/services/vdr.service';
import {TrackRecord} from '../../../../../client-sdk/models/TrackRecord';

@Component({
  selector: 'app-logbook-entries',
  templateUrl: './entries.component.html',
  styleUrls: ['./entries.component.scss']
})
export class LogbookEntriesComponent {

  @Input() record: TrackRecord;

  constructor(public service: LogbookEntriesService, public vdrService: VdrService) {
  }

}
