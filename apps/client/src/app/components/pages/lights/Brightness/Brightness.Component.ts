import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ComponentTemplate} from '../../../../service/ComponentTemplate';
import {Scene} from '../../../../client-sdk/models/Scene';
import {LightGroupService} from '../../../../client-sdk/services/lightGroup.service';

@Component({
  selector: 'app-light-brightness',
  templateUrl: './Brightness.Component.html',
  styleUrls: ['./Brightness.component.scss']
})

export class BrightnessComponent extends ComponentTemplate {

  static show = false;

  @Input() scene: Scene;
  @Output() sceneChanged: EventEmitter<Scene> = new EventEmitter<Scene>();

  close(): void {
    BrightnessComponent.show = false;
  }

  async onChange(): Promise<void> {
    this.sceneChanged.emit(this.scene);
    await this.lightGroupService.controlManual(this.getSelectedGroup(), this.scene.R, this.scene.G, this.scene.B, this.scene.BRI);
  }

  constructor(private lightGroupService: LightGroupService) {
    super();
  }

}
