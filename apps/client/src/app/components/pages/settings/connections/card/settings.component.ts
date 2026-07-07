import {Component, Input} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-settings-connections-card',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})

export class ConnectionSettingsCardComponent {

  @Input() title: string;
  @Input() value: string;
  @Input() iconName: string;
  @Input() background = '#202020';

  constructor(private router: Router) {
  }

}
