import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {DateHelper} from '../../../service/DateHelper';
import {dateDiff} from '../../../service/DateDiff';
import {ComponentTemplate} from '../../../service/ComponentTemplate';
import {Helper} from '../../../service/Helper';
import convertGrade from 'convert-grades';
import {NgAudioRecorderService} from 'ng-audio-recorder';
import {Router} from '@angular/router';
import {VoiceCenterService} from '../../../service/voiceCenter.service';
import {SocketService} from '../../../service/socket.service';
import $ from 'jquery';
import {Track} from '../../../client-sdk/models/Track';
import {CustomRecordService} from '../../../client-sdk/services/customRecord.service';
import {VdrService} from '../../../client-sdk/services/vdr.service';
import {ConvertingService} from '../../../service/converting.service';
import {LoaderService} from '../../../service/loader.service';
import {TrackRecord} from '../../../client-sdk/models/TrackRecord';
import {ExtractDataService} from '../../../service/extractData.service';
import {PreviewRouteService} from '../../../service/previewRoute.service';

@Component({
  selector: 'app-logbook',
  templateUrl: './logbook.component.html',
  styleUrls: ['./logbook.component.scss']
})
export class LogbookComponent extends ComponentTemplate implements AfterViewInit {

  dashboardViewVisibility = true;
  mapViewVisibility = false;
  waypointDetailsViewVisibility = false;

  activeTrack: Track;
  selectedLog = new TrackRecord();

  detailsTitle = 'Letzter Logbucheintrag';

  active = false;
  voiceWindow = false;

  constructor(public audioRecorderService: NgAudioRecorderService,
              public customRecord: CustomRecordService,
              public voiceCenter: VoiceCenterService,
              public service: VdrService,
              private websocket: SocketService,
              private router: Router,
              public convert: ConvertingService,
              private loader: LoaderService,
              public previewService: PreviewRouteService,
              private extract: ExtractDataService) {
    super();
    this.audioRecorderService.recorderError.subscribe(recorderErrorCase => {
      console.log('Catch Error, while Audio-Recording');
    });
  }

  async ngAfterViewInit(): Promise<void> {

    this.loader.startLoading();

    const tracks = await this.service.getTracks();

    this.activeTrack = tracks.find(x => x.stopAt == null);

    if (this.activeTrack == null) {
      this.loader.stopLoading();
      await this.router.navigate(['/logbook']);
      return;
    } else {

      if (window.screen.width > 700) {
        this.waypointDetailsViewVisibility = true;
        this.mapViewVisibility = true;
      }

      this.activeTrack = await this.service.getTrack(this.activeTrack.id);
      this.active = this.activeTrack != null;

      this.selectLatestWaypoint();

      this.listenWebSocket();
    }

    this.previewService.setVisibility(true);

    this.loader.stopLoading();
  }

  listenWebSocket(): void {
    this.websocket.client.on('vdr.log', async (newWaypoint: TrackRecord) => {
      this.activeTrack = await this.service.getTrack(this.activeTrack.id);
      this.selectLatestWaypoint();
    });
  }

  selectLatestWaypoint(): void {
    this.selectedLog = this.activeTrack.records[this.activeTrack.records.length - 1];
  }

  selectWaypoint(trackDetail: TrackRecord): void {
    this.detailsTitle = 'Ausgewählter Wegpunkt';
    this.selectedLog = trackDetail;
    this.showWaypointDetails();
  }

  showDetails(log: TrackRecord): void {
    this.selectedLog = log;
  }

  convert2Date(x): string {
    return DateHelper.convertToDate(x + '');
  }

  convert2Time(x): string {
    return DateHelper.convertToTime(x + '', false);
  }

  getSpeedAverage(track: Track): number {
    return (60 * this.getDistance(track)) / ((this.getTime(track).hour * 60) + this.getTime(track).minute);
  }

  getMaxSpeed(track: Track): number {
    /* const items = track.records.map((log: TrackRecord) => {
      const speed = this.extract.getSpeed(log.data);
      if (speed != null) {
        return speed;
      }
    });
    return Math.max(...items) * 1.944; */
    return 0;
  }

  getTime(track: Track): any {
    return dateDiff(new Date(track.createdAt), new Date(track.stopAt), 'hour', 'minute');
  }

  getTimeRangeNow(track: Track): any {
    return dateDiff(new Date(track.createdAt), new Date(), 'hour', 'minute');
  }

  getDistance(track): number {

    let sum = 0;

    let latestLon: number;
    let latestLat: number;

    track.details.forEach((log: TrackRecord) => {

      const lat = this.extract.getLatitude(log.data);
      const lon = this.extract.getLongitude(log.data);

      if (latestLat != null && latestLon != null) {
        const tempSum = this.getDistanceFromLatLonInNM(lat, lon, latestLat, latestLon);
        sum += tempSum;
      }
      latestLon = lon;
      latestLat = lat;
    });

    return sum;
  }

  formatCords(value: number): string {
    let valueAsString: string = value + '';
    valueAsString = valueAsString.split('.')[0];

    const grad: number = +valueAsString;
    const x: number = (value - grad) * 60;
    const minute: number = (Math.round(x * 1000) / 1000);

    return grad + '° ' + minute + '\' N';
  }

  getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

  getDistanceFromLatLonInNM(lat1: number, lon1: number, lat2: number, lon2: number): number {
    return this.getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) / 1.825;
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  rad2deg(rad: number): number {
    const x = rad * 180 / Math.PI;
    if (x < 0) {
      return x * (-1);
    }
    return x;
  }

  convertCord(lat, lon): Array<string> {
    return Helper.convertCoordinates(lat, lon);
  }

  calcCelsius(x: number): number {
    return convertGrade(x, 'k', 'c');
  }

  ToggleVoiceAssistant(): void {
    this.voiceWindow = !this.voiceWindow;
  }

  showDashboard(): void {
    this.dashboardViewVisibility = true;
    this.mapViewVisibility = false;
    this.waypointDetailsViewVisibility = false;
    $('#dashboard_btn').addClass('selected');
    $('#map_btn').removeClass('selected');
    $('#info_btn').removeClass('selected');
  }

  async showMap(): Promise<void> {
    if (this.activeTrack != null) {
      this.dashboardViewVisibility = false;
      this.mapViewVisibility = true;
      this.waypointDetailsViewVisibility = false;
      $('#dashboard_btn').removeClass('selected');
      $('#map_btn').addClass('selected');
      $('#info_btn').removeClass('selected');
    }
  }

  showWaypointDetails(): void {
    this.dashboardViewVisibility = false;
    this.mapViewVisibility = false;
    this.waypointDetailsViewVisibility = true;
    $('#dashboard_btn').removeClass('selected');
    $('#map_btn').removeClass('selected');
    $('#info_btn').addClass('selected');
  }
}
