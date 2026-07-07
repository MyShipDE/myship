import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Router} from '@angular/router';
import {ComponentTemplate} from '../../../../service/ComponentTemplate';
import {PreviewRouteService} from '../../../../service/previewRoute.service';
import {AlertsService, AlertState} from '../../../../service/alerts.service';
import {ConvertingService} from '../../../../service/converting.service';
import {Track} from '../../../../client-sdk/models/Track';
import {VdrService} from '../../../../client-sdk/services/vdr.service';
import {TrackService} from '../../../../client-sdk/services/track.service';
import {CoreService} from '../../../../service/core.service';
import {TrackRecord} from '../../../../client-sdk/models/TrackRecord';
import {LoaderService} from '../../../../service/loader.service';
import {ExtractDataService} from '../../../../service/extractData.service';
import {TrackView} from '../archive/archive.component';
import {DatetimeService} from '../../../../service/datetime.service';
import {EditorService} from '../../../controls/editor/editor.service';
import {Resource} from '../../../../Resource';
import {Coordinate} from '../../../../client-sdk/classes/Coordinate';
import {SignalKIdentifier} from '../../../../client-sdk/classes/SignalKIdentifier';
import {UnitService} from '../../../../service/unit.service';
import {LogbookEntriesService} from './entries/entries.service';
import {SocketService} from '../../../../service/socket.service';
import {SocketChannel} from '../../../../client-sdk/resources/SocketChannel';

@Component({
  selector: 'app-logbook-view-route',
  templateUrl: './previewRoute.component.html',
  styleUrls: ['./previewRoute.component.scss']
})
export class PreviewRouteComponent implements OnInit {

  @Input() title = '';

  @Input('track') trackInput: Track;
  track: TrackView;

  @Input() coords: number[][] = [];

  selectedRecord: TrackRecord;
  detailsTitle = 'Letzter Logbucheintrag:';

  speedOfRecord = -1;
  courseOfRecord = -1;
  motorStateOfRecord = -1;
  windSpeedOfRecord = -1;
  windDirectionOfRecord = -1;
  outsideTemperatureOfRecord = -1;

  constructor(private router: Router,
              public vdrService: VdrService,
              public service: PreviewRouteService,
              public convert: ConvertingService,
              public extract: ExtractDataService,
              public datetimeService: DatetimeService,
              public logbookEntriesService: LogbookEntriesService,
              protected trackService: TrackService,
              protected alertService: AlertsService,
              protected coreService: CoreService,
              protected loader: LoaderService,
              protected editor: EditorService,
              protected unitService: UnitService,
              protected ws: SocketService) {
    //
  }

  async ngOnInit(): Promise<void> {
    this.loader.startLoading();
    await this.extract.init();

    if (this.trackInput == null && this.coords.length === 0) {
      this.loader.stopLoading();
      await this.router.navigate(['logbook']);
      return;
    }

    if (this.trackInput != null && this.coords.length === 0) {
      const track = await this.trackService.getTrack(this.trackInput.id);
      this.track = Object.assign(new TrackView(), track);

      if (this.title === '') {
        this.title = `Logbuch vom ${this.convert.convert2Date(this.track.createdAt)}`;
      }
      this.track.duration = Math.round(track.stopAt == null ? 0 : this.datetimeService.getDifferenceInMinutes(new Date(track.createdAt), new Date(track.stopAt)));

      await this.setLatestWaypoint();
      this.listenWebSocket();
    } else {
      this.title = `Logbuch`;
    }

    this.loader.stopLoading();
  }

  shouldMapDisplay(): boolean {
    return ((this.track != null && this.track?.records.length > 0) || this.coords.length > 0) && !this.logbookEntriesService.visibility;
  }

  async setLatestWaypoint(): Promise<void> {
    this.selectedRecord = this.track.records[this.track.records.length - 1];

    await this.loadDataOnSelect();
  }

  async selectWaypoint(trackRecord: TrackRecord): Promise<void> {
    this.detailsTitle = 'Ausgewählter Eintrag:';
    this.selectedRecord = trackRecord;

    await this.loadDataOnSelect();
  }

  async loadDataOnSelect(): Promise<void> {
    this.speedOfRecord = -1;
    this.courseOfRecord = -1;
    this.motorStateOfRecord = -1;
    this.windSpeedOfRecord = -1;
    this.windDirectionOfRecord = -1;
    this.outsideTemperatureOfRecord = -1;

    const speedData = await this.trackService.getTrackData(this.selectedRecord.id, SignalKIdentifier.navigationSpeedOverGround);
    this.speedOfRecord = this.convert.round(speedData != null ? this.unitService.convert(speedData.value, 'm/s').value : -1, 1);

    const courseData = await this.trackService.getTrackData(this.selectedRecord.id, SignalKIdentifier.navigationCourseOverGroundTrue);
    this.courseOfRecord = this.convert.round(courseData != null ? this.unitService.convert(courseData.value, 'rad').value : -1, 0);

    const motorStateData = await this.trackService.getTrackData(this.selectedRecord.id, SignalKIdentifier.electricalAlternators0RevolutionsValue);
    this.motorStateOfRecord = motorStateData != null ? (motorStateData.value > 0 ? 1 : 0) : -1;

    const windSpeedData = await this.trackService.getTrackData(this.selectedRecord.id, SignalKIdentifier.environmentWindSpeedApparent);
    this.windSpeedOfRecord = this.convert.round(windSpeedData != null ? this.unitService.convert(windSpeedData.value, 'm/s').value : -1, 1);

    const windDirectionData = await this.trackService.getTrackData(this.selectedRecord.id, SignalKIdentifier.environmentWindAngleApparent);
    this.windDirectionOfRecord = this.convert.round(windDirectionData != null ? this.unitService.convert((windDirectionData.value < 0 ? windDirectionData.value * (-1) : windDirectionData.value), 'rad').value : -1, 0);

    const outsideTemperatureData = await this.trackService.getTrackData(this.selectedRecord.id, SignalKIdentifier.environmentOutsideTemperature);
    this.outsideTemperatureOfRecord = this.convert.round(outsideTemperatureData != null ? this.unitService.convert(outsideTemperatureData.value, 'K').value : -1, 1);
  }

  getDistance(track): number {
    const coordinates: Coordinate[] = [];
    track.records.forEach((log: TrackRecord) => {
      const lat = this.extract.getLatitude(log.data);
      const lon = this.extract.getLongitude(log.data);
      if (lat != null && lon != null) {
        coordinates.push({latitude: lat, longitude: lon});
      }
    });
    return this.convert.calculateDistance(coordinates);
  }

  async changeTrackName(): Promise<void> {
    const editor = await this.editor.openModal(Resource.ChangeTrackNameModalText, this.track.name);
    this.loader.startLoading();
    if (editor !== this.track.name) {
      this.track.name = editor;
      if (!(await this.trackService.saveTrack(this.track))) {
        this.alertService.alert(AlertState.Error, Resource.ErrorWhileSaveTrackData);
      }
    }
    this.loader.stopLoading();
  }

  async dispose(home = false): Promise<void> {
    this.service.setVisibility(false);
    if (home) {
      await this.router.navigate(['home']);
    }
  }

  listenWebSocket(): void {
    this.ws.client.on(SocketChannel.TrackDetailManagedObject.toString(), async (data: TrackRecord) => {

      const lat = await this.trackService.getTrackData(data.id, SignalKIdentifier.navigationPositionValueLatitude);
      const lon = await this.trackService.getTrackData(data.id, SignalKIdentifier.navigationPositionValueLongitude);

      if (lat != null && lon != null) {
        this.track.records.push(data);
        await this.selectWaypoint(data);
      }

    });
  }

}
