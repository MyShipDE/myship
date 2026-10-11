import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {HttpService} from '../../../../client-sdk/services/http.service';
import {Client} from '../../../../client-sdk/models/Client';
import {LoaderService} from '../../../../service/loader.service';

@Component({
  selector: 'app-settings-menu',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})

export class SettingsMenuComponent implements OnInit {

  client: Client;

  menuItems = [
    // ['Personalisierung', '/settings/custom'],
    ['Voyage Data Recorder', '/settings/blackbox'],
    ['Logbuch', '/settings/blackbox/keywords'],
    ['Warnungen', '/settings/alarms'],
    ['Dashboard', '/settings/custom']
  ];

  constructor(private router: Router, private http: HttpClient,
              private httpService: HttpService, private loader: LoaderService) {
  }

  async ngOnInit(): Promise<void> {
    this.loader.startLoading();
    await this.getClientData();
    this.loadMenu();
    this.loader.stopLoading();
  }

  getClientData(): Promise<void> {
    return new Promise((resolve => {
      this.http
        .get(this.httpService.api + '/client', this.httpService.options)
        .subscribe((client: Client) => {
          this.client = client;
          resolve();
        }, (err: HttpErrorResponse) => {
          // TODO Alert
          resolve();
        });
    }));
  }

  loadMenu(): void {
    // this.menuItems.push(['Cloud', '/cloud/menu']);
    this.menuItems.push(['System', '/settings/system']);
  }

}
