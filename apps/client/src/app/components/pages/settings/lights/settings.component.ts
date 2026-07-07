import {Component, OnInit} from '@angular/core';
import {ComponentTemplate} from '../../../../service/ComponentTemplate';
import {LightService} from '../../../../client-sdk/services/light.service';
import {LightGroupService} from '../../../../client-sdk/services/lightGroup.service';
import {LightGroup} from '../../../../client-sdk/models/LightGroup';
import {Light} from '../../../../client-sdk/models/Light';
import {LoaderService} from '../../../../service/loader.service';

@Component({
  selector: 'app-settings-lights',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})

export class LightSettingsComponent extends ComponentTemplate implements OnInit {

  groupName: string;
  selectedLightId = 0;

  constructor(private lightService: LightService, public lightGroupService: LightGroupService,
              private loader: LoaderService) {
    super();
  }

  async ngOnInit(): Promise<void> {
    this.loader.startLoading();
    await this.lightGroupService.load();
    await this.lightService.load();
    this.loader.stopLoading();
  }

  getGroups(): Array<LightGroup> {
    return this.lightGroupService.list;
  }

  getLights(): Array<Light> {
    return this.lightService.list;
  }

}

