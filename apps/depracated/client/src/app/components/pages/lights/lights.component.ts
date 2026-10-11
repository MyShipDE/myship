import {Component, OnInit} from '@angular/core';
import {ComponentTemplate} from '../../../service/ComponentTemplate';
import {BrightnessComponent} from './Brightness/Brightness.Component';
import {NightModeService} from '../../../client-sdk/services/nightMode.service';
import $ from 'jquery';
import {Scene} from '../../../client-sdk/models/Scene';
import {LightGroupService} from '../../../client-sdk/services/lightGroup.service';
import {DeviceService} from '../../../client-sdk/services/device.service';
import {LightGroup} from '../../../client-sdk/models/LightGroup';
import {Device} from '../../../client-sdk/models/Device';
import {LoaderService} from '../../../service/loader.service';

@Component({
  selector: 'app-lights',
  templateUrl: './lights.component.html',
  styleUrls: ['./lights.component.scss'],
})

export class LightsComponent extends ComponentTemplate implements OnInit {

  static title = 'Beleuchtung';

  selectedLightForGroup: number;

  blankScene: Scene = new Scene();

  constructor(public lightGroupService: LightGroupService,
              public deviceService: DeviceService,
              private loader: LoaderService,
              public nightModeService: NightModeService) {
    super();
  }

  async ngOnInit(): Promise<void> {
    this.loader.startLoading();
    await this.lightGroupService.load();
    await this.deviceService.load();
    this.setSelectedGroup(null);
    this.setBlankScene();

    /* iro.ColorPicker('#rgbPicker', {
      layout: [
        {
          component: iro.ui.Slider,
          options: {
            sliderType: 'kelvin'
          }
        },
      ]
    }); */

    this.loader.stopLoading();
  }

  get title(): string {
    return LightsComponent.title;
  }

  getBrightnessSlider(): boolean {
    return BrightnessComponent.show;
  }

  ToggleSceneEditor(): void {
    $('#content-container').fadeToggle();
    $('#picker-overlay').slideToggle(200);
  }

  showBrightnessSlider(): void {
    BrightnessComponent.show = true;
  }

  async setScene(scene: Scene): Promise<void> {
    if (!this.getEditMode()) {
      await this.lightGroupService.control(this.getSelectedGroup(), scene);
    }
  }

  setSelectedGroup(selectedGroup: LightGroup): void {
    ComponentTemplate.selectedGroup = selectedGroup;
    if (selectedGroup == null) {
      LightsComponent.title = 'Beleuchtung';
    } else {
      LightsComponent.title = 'Beleuchtung - ' + selectedGroup.name;
    }
  }

  setBlankScene(): void {
    this.blankScene = new Scene();
  }

  async createScene(forAll: boolean = false): Promise<void> {
    this.loader.startLoading();

    if (forAll) {
      for (const lg of this.lightGroupService.list) {
        lg.scenes.push(this.blankScene);
        await this.lightGroupService.update(lg);
      }
    } else {
      this.getSelectedGroup().scenes.push(this.blankScene);
      await this.lightGroupService.update(this.getSelectedGroup());
    }

    this.setBlankScene();
    this.ToggleSceneEditor();
    this.loader.stopLoading();
  }

  async deleteScene(scene: Scene): Promise<void> {
    this.loader.startLoading();

    this.getSelectedGroup().scenes = this.getSelectedGroup().scenes.filter(x => x.id !== scene.id);
    await this.lightGroupService.update(this.getSelectedGroup());

    this.loader.stopLoading();
  }

  get devices(): Array<Device> {
    return this.deviceService.list.filter(x => x.type === 'light');
  }

}
