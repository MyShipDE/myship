import {AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {SocketService} from '../../../../service/socket.service';
import {Track} from '../../../../client-sdk/models/Track';
import {TrackRecord} from '../../../../client-sdk/models/TrackRecord';
import {ExtractDataService} from '../../../../service/extractData.service';
import {OpenLayerExtension} from '../../../../extensions/OpenLayerExtension';
import {ConvertingService} from '../../../../service/converting.service';
import {LoaderService} from '../../../../service/loader.service';
import {TrackService} from '../../../../client-sdk/services/track.service';
import {UnitService} from '../../../../service/unit.service';
import {DatetimeService} from '../../../../service/datetime.service';

@Component({
  selector: 'app-logbook-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})

export class MapComponent extends OpenLayerExtension implements AfterViewInit {

  @ViewChild('map') mapEl: ElementRef;

  @Input() track: Track;
  @Input() coords: number[][] = [];

  @Output() WaypointSelected: EventEmitter<TrackRecord> = new EventEmitter<TrackRecord>();

  constructor(protected websocket: SocketService,
              protected extract: ExtractDataService,
              protected convert: ConvertingService,
              protected loader: LoaderService,
              protected trackSDK: TrackService,
              protected unit: UnitService,
              protected datetimeService: DatetimeService) {
    super(convert, loader, trackSDK, extract, unit, datetimeService, websocket);
  }

  async ngAfterViewInit(): Promise<void> {

    const layers = [
      this.layers.google,
      this.layers.openSeaMap,
    ];
    const controls = [
      //
    ];

    if (this.coords.length > 0) {
      this.createMap(this.coords[0][0], this.coords[0][1], layers, controls);
      await this.selectCoords(this.coords);
    } else {

      const latestRecord = this.track.records[this.track.records.length - 1];

      if (latestRecord != null) {

        const latestLat = this.extract.getLatitude(latestRecord.data);
        const latestLon = this.extract.getLongitude(latestRecord.data);

        this.inArchiveMode = true;

        this.createMap(latestLat, latestLon, layers, controls);
        await this.selectTrack(this.track, true);

        this._waypointSelected.subscribe((record: TrackRecord) => {
          this.WaypointSelected.emit(record);
        });

      }

    }

  }

}
