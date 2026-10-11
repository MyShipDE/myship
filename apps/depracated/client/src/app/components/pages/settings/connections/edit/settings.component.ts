import {Component, Input, OnInit, Output} from '@angular/core';
import {AlertsComponent} from '../../../../controls/alerts/alerts.component';

@Component({
  selector: 'app-settings-connections-edit-card',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})

export class ConnectionSettingsEditCardComponent implements OnInit {

  @Input() title: string;
  @Input() value: string;
  @Input() iconName: string;
  @Input() background = '#202020';

  storageValue: string;

  constructor() {
  }

  ngOnInit(): void {
    if (localStorage.getItem(this.value) == null) {
      this.storageValue = localStorage.getItem(this.value);
      console.log(this.storageValue);
    }
  }

  isValuesExists(): boolean {
    return localStorage.getItem(this.value) != null;
  }

  saveValue(): void {
    localStorage.setItem(this.value, this.storageValue);
    // TODO Alert
  }

}
