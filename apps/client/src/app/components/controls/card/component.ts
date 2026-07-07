import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-info-card',
  templateUrl: './component.html',
  styleUrls: ['./component.scss']
})
export class InfoCardComponent {

  @Input() title = '';
  @Input() subTitle = '';
  @Input() value = '';
  @Input() valueRight = '';

  constructor() {
  }

}
