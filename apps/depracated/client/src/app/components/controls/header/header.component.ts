import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ComponentTemplate} from '../../../service/ComponentTemplate';
import {Router} from '@angular/router';
import {AvNavService} from '../../../service/AvNav.service';
import {NightModeService} from '../../../client-sdk/services/nightMode.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent extends ComponentTemplate {

  @Input() title: string;
  @Input() icon: string;
  @Input() iconSize = '32';
  @Input() editable = false;
  @Input() homeButton = true;
  @Input() welcome = false;
  @Input() border = true;
  @Input() backUrl: string = null;
  @Input() redirectForce = false;

  @Output() HomeButtonAction: EventEmitter<void> = new EventEmitter<void>();
  @Output() BackAction: EventEmitter<void> = new EventEmitter<void>();

  @Input() CreationButton = false;
  @Output() CreationActionPerform: EventEmitter<void> = new EventEmitter<void>();

  constructor(private avNavService: AvNavService,
              private router: Router,
              public nightModeService: NightModeService) {
    super();
  }

  async NavigateHome(link: string): Promise<void> {

    if (this.HomeButtonAction.observers.length > 0) {
      this.HomeButtonAction.emit();
      return;
    }


    if (this.avNavService.getVisibility()) {
      this.avNavService.setVisibility(false);
      return;
    }
    await this.router.navigate([link]);
  }

  async NavigateBack(): Promise<void> {

    if (this.BackAction.observers.length > 0) {
      this.BackAction.emit();
      return;
    }

    await this.router.navigate([this.backUrl]);
  }

  ToggleEditMode(): void {
    ComponentTemplate.editMode = this.ToggleBoolean(this.getEditMode());
    if (this.getEditMode()) {
      // TODO Alert
    } else {
      // TODO Alert
    }
  }

}
