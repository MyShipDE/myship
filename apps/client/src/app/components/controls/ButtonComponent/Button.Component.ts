import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CoreService} from '../../../service/core.service';

@Component({
  selector: 'app-custom-button',
  templateUrl: './Button.Component.html',
  styleUrls: ['./Button.Component.scss']
})

export class CustomButtonComponent {

  @Output() actionPerform: EventEmitter<void> = new EventEmitter<void>();

  @Input() title?: string;
  @Input() icon?: string;
  @Input() type: CustomButtonType;

  get ClassProperties(): string {
    let value = '';
    if (this.type === CustomButtonType.error) {
      value += ' danger';
    } else if (this.type === CustomButtonType.success) {
      value += 'success';
    }
    return value;
  }

  constructor(public core: CoreService) {
    //
  }

  click(): void {
    if (!this.core.isBusy) {
      this.actionPerform.emit();
    }
  }

}

export enum CustomButtonType {
  default,
  error,
  success
}
