import {Component, Input, Output} from '@angular/core';
import {ComponentTemplate} from '../../../service/ComponentTemplate';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html'
})
export class ButtonComponent extends ComponentTemplate {

  @Input() title: string;
  @Input() icon: string;
  @Input() additionalCSS = '';
  @Input() padding = 'p-2';
  @Input() selected = false;

  constructor() {
    super();
  }

}
