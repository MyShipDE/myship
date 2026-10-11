import {Component, OnInit} from '@angular/core';
import {ComponentTemplate} from '../../../../service/ComponentTemplate';
import {MenuItem} from "../../../../models/MenuItem";
import {AlertsService, AlertState} from "../../../../service/alerts.service";

@Component({
  selector: 'app-settings-custom',
  templateUrl: './CustomSettingsComponent.html',
  styleUrls: ['./CustomSettingsComponent.scss'],
})

export class CustomSettingsComponent extends ComponentTemplate implements OnInit {

  confirmReset = false;
  utc = +localStorage.getItem('utc');

  public nav: Array<MenuItem> = [];

  constructor(private alert: AlertsService) {
    super();
  }

  ngOnInit(): void {
    this.nav = MenuItem.getAll();
  }

  saveChanges(): void {

    let search = this.nav.filter(x => x.favorite);
    if (search != null && search.length > 4) {
      this.alert.alert(AlertState.Error, 'You can only have 4 favorites');
      this.nav = JSON.parse(localStorage.getItem('MyShip.MenuItems'));
      return;
    }

    search = this.nav.filter(x => x.link === '/settings' && x.favorite);
    if (search != null && search.length > 0) {
      this.alert.alert(AlertState.Error, 'You can\'t remove the settings page from the menu');
      this.nav = JSON.parse(localStorage.getItem('MyShip.MenuItems'));
      return;
    }

    const nav = JSON.stringify(this.nav);
    localStorage.setItem('MyShip.MenuItems', nav);
  }

  swap(indexA: number, indexB: number): void {
    const temp = this.nav[indexA];
    this.nav[indexA] = this.nav[indexB];
    this.nav[indexB] = temp;
    this.saveChanges();
  }

}

