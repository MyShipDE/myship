import {AfterViewInit, Component, ElementRef, IterableDiffers, OnInit, ViewChild} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {ComponentTemplate} from '../../../service/ComponentTemplate';
import {AvNavService} from '../../../service/AvNav.service';
import $ from 'jquery';
import {CustomRecordService} from '../../../client-sdk/services/customRecord.service';
import {SignalKService} from '../../../service/SignalK.Service';
import {ConvertingService} from '../../../service/converting.service';
import {HttpClient} from '@angular/common/http';
import {HttpService} from '../../../client-sdk/services/http.service';
import {SignalkData} from '../../../client-sdk/models/SignalkData';
import {NightModeService} from '../../../client-sdk/services/nightMode.service';
import {Resource} from '../../../Resource';
import {SecurityQueryResult} from '../../controls/securityQuery/securityQuery.component';
import {LoaderService} from '../../../service/loader.service';
import {SecurityQueryService} from '../../../service/securityQuery.service';
import {Helper} from '../../../service/Helper';

@Component({
  selector: 'app-position-lights-avnav',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})

export class PlotterComponent extends ComponentTemplate implements AfterViewInit {

  private currentZoom = window.innerWidth / window.outerWidth;

  @ViewChild('mapContainer', {static: false}) mapContainer: ElementRef;
  @ViewChild('avNavFrame', {static: false}) iframeRef: ElementRef;

  showWindWidget = false;
  showMotorWidget = true;

  motorSpeed = 0;
  cog = 0;
  iframeUrl: SafeResourceUrl = null;
  failed = false;
  height = 100;
  width = 100;

  private iterableDiffer: any;

  constructor(protected sanitizer: DomSanitizer,
              public service: AvNavService,
              private customRecordService: CustomRecordService,
              private signalK: SignalKService, differs: IterableDiffers,
              private convert: ConvertingService,
              private http: HttpClient,
              private httpService: HttpService,
              public nightModeService: NightModeService,
              private loader: LoaderService,
              private securityQueryService: SecurityQueryService) {
    super();
    this.iterableDiffer = differs.find([]).create(null);
    if (window.innerWidth < 600) {
      this.height = 83.5;
      this.width = 100;
    }
  }

  async ngAfterViewInit(): Promise<void> {
    const url = this.httpService.api + ':' + 8080;
    this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  showWindGauge(): void {
    $('.wind-overlay').fadeIn();
  }

  hideWindGauge(): void {
    $('.wind-overlay').fadeOut();
  }


  // tslint:disable-next-line:use-lifecycle-interface
  ngDoCheck(): void {
    const changes = this.iterableDiffer.diff(this.signalK.dataList);
    if (changes) {
      this.signalK.dataList.forEach((element: SignalkData) => {
        switch (element.getDesc()) {
          case 'electrical.alternators.0.revolutions':
            this.motorSpeed = this.round(element.getValue() * 60);
            break;
          case 'position-lights.courseOverGroundTrue':
            this.cog = +this.convert.rad2deg(element.getValue()).toFixed();
            break;
        }
      });
    }
  }

  OpenLogbookReminder(): void {
    this.customRecordService.setVisibility(true);
  }

  Dispose(): void {
    $('.avNav-wrapper').fadeOut();
  }

  switchWindWidget(): void {
    this.showWindWidget = true;
    this.showMotorWidget = false;
  }

  switchMotorWidget(): void {
    this.showWindWidget = false;
    this.showMotorWidget = true;
  }

  async setNightMode(): Promise<void> {
    this.loader.startLoading();
    const state = await this.nightModeService.getState();
    this.loader.stopLoading();
    const query = await this.securityQueryService.show(state ? Resource.NightModeDeactivateSecurityQuery : Resource.NightModeActivateSecurityQuery, true, true, false) === SecurityQueryResult.Yes;
    this.loader.startLoading();
    if (state && query) {
      await this.nightModeService.setState(false);
    } else if (query) {
      await this.nightModeService.setState(true);
    }
    this.loader.stopLoading();
  }

}
