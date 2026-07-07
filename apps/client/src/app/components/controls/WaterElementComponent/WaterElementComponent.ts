import {Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';

@Component({
  selector: 'app-element-water',
  templateUrl: './WaterElementComponent.html',
  styleUrls: ['./WaterElementComponent.scss']
})

export class WaterElementComponent {

  @Input() value: number;

  constructor() {
  }

}
