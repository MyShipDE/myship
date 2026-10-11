import {AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ComponentTemplate} from '../../../../service/ComponentTemplate';

@Component({
  selector: 'app-logbook-info-card',
  templateUrl: './infoCard.component.html',
  styleUrls: ['./infoCard.component.scss']
})

export class InfoCardLogbookComponent extends ComponentTemplate {

  @Input()
  name: string;

  @Input()
  values: string[];

  constructor() {
    super();
  }

}
