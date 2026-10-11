import {Component} from '@angular/core';
import {LoaderService} from '../../../service/loader.service';
import {NightModeService} from '../../../client-sdk/services/nightMode.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {
  constructor(public service: LoaderService, public nightModeService: NightModeService) {
    //
  }
}
