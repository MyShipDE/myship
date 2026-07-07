import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ComponentTemplate} from '../../../../service/ComponentTemplate';

@Component({
  selector: 'app-settings-connections',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})

export class ConnectionSettingsComponent extends ComponentTemplate implements OnInit {

  currentServer: string;
  currentSignalK: string;

  backupServer: string;
  backupSignalK: string;

  type = localStorage.getItem('type');

  constructor(private router: Router) {
    super();
  }

  async ngOnInit(): Promise<void> {
    this.loadServer();
  }

  loadServer(): void {
    this.currentServer = localStorage.getItem('server');
    this.currentSignalK = localStorage.getItem('signalk');

    if (this.currentServer === localStorage.getItem('server1')) {
      this.backupServer = localStorage.getItem('server2');
    } else {
      this.backupServer = localStorage.getItem('server1');
    }

    if (this.currentSignalK === localStorage.getItem('signalk1')) {
      this.backupSignalK = localStorage.getItem('signalk2');
    } else {
      this.backupSignalK = localStorage.getItem('signalk1');
    }
  }

  isEncrypted(): string {
    return 'unlock';
  }

}

