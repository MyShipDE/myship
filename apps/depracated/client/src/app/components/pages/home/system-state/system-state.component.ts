import {Component, EventEmitter, IterableDiffers, OnInit, Output} from '@angular/core';
import {SignalKService} from '../../../../service/SignalK.Service';
import {SocketService} from '../../../../service/socket.service';
import {TemplateVDR} from '../../../../client-sdk/models/TemplateVDR';
import {SignalkData} from '../../../../client-sdk/models/SignalkData';
import { HttpClient } from '@angular/common/http';
import {HttpService} from '../../../../client-sdk/services/http.service';
import {Track} from '../../../../client-sdk/models/Track';
import {TemplateVDRService} from '../../../../client-sdk/services/templateVDR.service';
import {NightModeService} from '../../../../client-sdk/services/nightMode.service';
import {SocketChannel} from "../../../../client-sdk/resources/SocketChannel";
import {NavigationPlotterService} from "../../navigation-plotter/navigation-plotter.service";

@Component({
  selector: 'app-system-state',
  templateUrl: './system-state.component.html',
  styleUrls: ['./system-state.component.scss']
})

export class SystemStateComponent implements OnInit {

  gpsSatellites = 0;

  private iterableDiffer: any;

  templates: TemplateVDR[] = [];
  selectedVDRTemplate: TemplateVDR = new TemplateVDR();
  vdrState = false;

  cloudState = false;

  constructor(private signalK: SignalKService, differs: IterableDiffers,
              public ws: SocketService,
              private http: HttpClient,
              private httpService: HttpService,
              private templateService: TemplateVDRService,
              public nightModeService: NightModeService,
              public plotterService: NavigationPlotterService) {
    this.iterableDiffer = differs.find([]).create(null);
  }

  async ngOnInit(): Promise<void> {
    this.templates = await this.templateService.GetTemplates();
    await this.setVDRState();
    this.selectedVDRTemplate = this.templates.find(x => x.active);
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngDoCheck(): void {
    const changes = this.iterableDiffer.diff(this.signalK.dataList);
    if (changes) {
      this.signalK.dataList.forEach((element: SignalkData) => {
        switch (element.getDesc()) {
          case 'navigation.gnss.satellites':
            this.gpsSatellites = element.getValue();
            break;
        }
      });
    }
  }

  get SignalKState(): boolean {
    return SignalKService.state;
  }

  restartSignalK(): void {
    const server = localStorage.getItem('MyShip.ServerUrl');
    this.http.post(this.httpService.api + '/api/signalk/restart', {}, this.httpService.options).subscribe(() => {
      console.log('SignalK Restarting');
    });
  }

  setVDRState(): Promise<void> {
    return new Promise<void>(resolve => {
      this.http
        .get(this.httpService.api + '/tracks', this.httpService.options)
        .subscribe((res: Track[]) => {
          if (res.find(x => x.stopAt == null) != null) {
            this.vdrState = true;
          }
          resolve();
        }, err => {
          resolve();
        });
    });
  }

  listenWebSocket(): void {
    this.ws.client.on(SocketChannel.VdrServiceStateObject.toString(), (state) => {
      this.vdrState = state;
    });
  }

}
