import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {loadPlayer, Player} from 'rtsp-relay/browser';
import {Router} from '@angular/router';
import {LoaderService} from '../../../service/loader.service';
import {NightModeService} from '../../../client-sdk/services/nightMode.service';
import {AlertsService, AlertState} from '../../../service/alerts.service';
import {Resource} from '../../../Resource';

@Component({
  selector: 'app-camera',
  templateUrl: './cam.component.html',
  styleUrls: ['./cam.component.scss']
})
export class CamComponent implements AfterViewInit {

  @ViewChild('video01')
  videoElement: ElementRef<HTMLCanvasElement>;

  server = localStorage.getItem('MyShip.ServerUrl');

  displayError = false;
  errorMessage = Resource.CameraConnectionFailed;

  constructor(private router: Router, private loader: LoaderService,
              public nightModeService: NightModeService,
              private alertService: AlertsService) {
    //
  }

  async ngAfterViewInit(): Promise<void> {
    this.loader.startLoading();
    await loadPlayer({
      url: `ws://${this.server}:2000/api/stream`,
      // @ts-ignore
      canvas: document.getElementById('video01'),
      onPlay: (player: Player) => this.loader.stopLoading(),
      onDisconnect: () => {
        //
      },
      onError: (error: Error) => {
        //
      }
    });
  }
}
