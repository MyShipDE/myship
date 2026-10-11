import {AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ComponentTemplate} from '../../../../service/ComponentTemplate';

@Component({
  selector: 'app-logbook-stats-card',
  templateUrl: './statsCard.component.html',
  styleUrls: ['./statsCard.component.scss']
})

export class StatsCardLogbookComponent extends ComponentTemplate {

  @Input()
  name: string;

  @Input()
  value: string;

  @Input()
  unit: string;

  @Input()
  edit = false;

  constructor() {
    super();
  }

}
