import {Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';

@Component({
  selector: 'app-element-battery-large',
  templateUrl: './BatteryLargeElementComponent.html',
  styleUrls: ['./BatteryLargeElementComponent.scss']
})

export class BatteryLargeElementComponent implements OnChanges {

  type: BatteryType = BatteryType.normal;
  @Input() value: number;

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.value <= 60) {
      this.type = BatteryType.low;
    } else if (this.value <= 90) {
      this.type = BatteryType.warning;
    } else if (this.value <= 100) {
      this.type = BatteryType.normal;
    }
  }

}

export enum BatteryType {
  normal = '#71b946',
  warning = '#fdc42f',
  low = '#d81c1c',
  night = '#C32626'
}
