import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {VdrOverlayService} from './vdr-overlay.service';
import {AudioRecordService} from '../../../../service/audioRecord.service';
import {SecurityQueryService} from '../../../../service/securityQuery.service';
import {SecurityQueryResult} from '../../../controls/securityQuery/securityQuery.component';
import {Resource} from '../../../../Resource';
import {CustomRecordService} from '../../../../client-sdk/services/customRecord.service';
import {Track} from '../../../../client-sdk/models/Track';
import {TrackService} from "../../../../client-sdk/services/track.service";
import {VdrService} from "../../../../client-sdk/services/vdr.service";
import {LoaderService} from "../../../../service/loader.service";

@Component({
  selector: 'app-vdr-overlay',
  templateUrl: './vdr-overlay.component.html',
  styleUrls: ['./vdr-overlay.component.scss']
})
export class VdrOverlayComponent implements OnInit {

  days: Date[] = [];

  startDate: string = null;
  endDate: string = null;

  @Output() selectedTrack: EventEmitter<Track> = new EventEmitter<Track>();
  @Output() selectCoords: EventEmitter<number[][]> = new EventEmitter<number[][]>();

  constructor(public service: VdrOverlayService,
              public audioRecordService: AudioRecordService,
              private securityQuery: SecurityQueryService,
              private trackService: TrackService,
              private vdrService: VdrService,
              private loader: LoaderService,
              private customRecord: CustomRecordService) {
    //
  }

  async ngOnInit(): Promise<void> {
    this.days = await this.trackService.getDates();
  }

  async stopRecording(): Promise<void> {
    const securityQueryResult = await this.securityQuery.show(Resource.ShouldAudioRecordStored, true, true, false) === SecurityQueryResult.Yes;
    this.audioRecordService.stopRecording();
  }

  async audioRecordActionPerform(): Promise<void> {
    if (this.audioRecordService.microphoneActive) {
      await this.stopRecording();
    } else {
      this.audioRecordService.startRecording();
    }
  }

  selectTrack(track: Track): void {
    this.selectedTrack.emit(track);
    this.service.close();
  }

  async selectDateRange(): Promise<void> {
    if (this.startDate != null && this.endDate != null) {
      this.loader.startLoading()
      const coords = await this.vdrService.getCoordsByDateRange(this.startDate, this.endDate);
      this.selectCoords.emit(coords);
      this.service.close()
      this.loader.stopLoading();
    }
  }

  async customRecordActionPerform(): Promise<void> {
    this.customRecord.setVisibility(true);
  }

}
