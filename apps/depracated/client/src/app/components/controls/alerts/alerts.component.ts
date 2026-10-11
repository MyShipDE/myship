import {Component, Input, OnInit} from '@angular/core';
import {AlertsService, AlertState} from '../../../service/alerts.service';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.scss']
})
export class AlertsComponent {

  constructor(public service: AlertsService) {
  }

  // tslint:disable-next-line:typedef
  get AlertStates() {
    return AlertState;
  }

}
