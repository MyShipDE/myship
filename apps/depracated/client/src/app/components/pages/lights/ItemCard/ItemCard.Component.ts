import {Component, Input} from '@angular/core';
import {ComponentTemplate} from '../../../../service/ComponentTemplate';
import {LightsComponent} from '../lights.component';
import {NightModeService} from '../../../../client-sdk/services/nightMode.service';
import {LightGroup} from '../../../../client-sdk/models/LightGroup';

@Component({
  selector: 'app-light-entity',
  templateUrl: './ItemCard.Component.html',
})

export class ItemCardComponent extends ComponentTemplate {

  @Input() obj: any;

  @Input() type = 'LightGroup';

  @Input() deletionEnabled = true;
  @Input() creationEnabled = false;
  @Input() controlEnabled = true;
  @Input() changeable = true;
  @Input() unlinkPossible = false;

  name: string = null;

  constructor() {
    super();
  }

  select(): void {
    if (this.type === 'LightGroup') {
      this.setSelectedGroup(this.obj);
      this.setTitle(this.obj.name);
    }
  }

  setSelectedGroup(selectedGroup: LightGroup): void {
    ComponentTemplate.selectedGroup = selectedGroup;
    if (selectedGroup == null) {
      LightsComponent.title = 'Lichter';
    }
  }

  setTitle(title: string): void {
    LightsComponent.title = title;
  }

}
