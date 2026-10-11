import {AfterViewInit, Component} from '@angular/core';
import {ComponentTemplate} from '../../../../service/ComponentTemplate';
import {AudioRecordService} from '../../../../service/audioRecord.service';
import { HttpClient } from '@angular/common/http';
import {SocketService} from '../../../../service/socket.service';
import {ManualInput, ManualInputType} from '../../../../client-sdk/models/ManualInput';
import {CustomRecordService} from '../../../../client-sdk/services/customRecord.service';
import {HttpService} from '../../../../client-sdk/services/http.service';
import {SocketChannel} from "../../../../client-sdk/resources/SocketChannel";

@Component({
  selector: 'app-vdr-custom-record',
  templateUrl: './CustomRecord.component.html',
  styleUrls: ['./CustomRecord.component.scss']
})

export class CustomRecordComponent extends ComponentTemplate implements AfterViewInit {

  Interval: NodeJS.Timeout;

  manualInputs: Array<ManualInput> = [];
  types: Array<ManualInputType> = [];

  constructor(public service: CustomRecordService,
              public audioService: AudioRecordService,
              private http: HttpClient,
              private websocket: SocketService,
              private httpService: HttpService) {
    super();
  }

  async ngAfterViewInit(): Promise<void> {
    this.loadManualInputs();
    this.listenWebsocket();
    this.audioService.listenWebSocket();
  }

  loadManualInputs(): void {
    this.http
      .get<ManualInput[]>(this.httpService.api + '/logbook/manualInputs', this.httpService.options)
      .subscribe((result: ManualInput[]) => {
        this.manualInputs = result;
        this.http
          .get<ManualInputType[]>(this.httpService.api + '/logbook/manualInputs/types', this.httpService.options)
          .subscribe((result2: ManualInputType[]) => {
            this.types = result2;
            this.types.forEach(type => {
              type.values = this.manualInputs.filter(x => x.typeId === type.id);
            });
          });
      });
  }

  listenWebsocket(): void {
    if (this.websocket.client != null) {
      clearInterval(this.Interval);
      this.websocket.client.on(SocketChannel.LogbookEntryReminderNotification.toString(), () => {
        this.service.setVisibility(true);
      });
    }
  }

  OpenChangesExists(): boolean {
    return this.types.find(x => x.values.find(y => y.IsSelected) != null) != null;
  }

  Dispose(): void {
    this.service.setVisibility(false);
  }

}
