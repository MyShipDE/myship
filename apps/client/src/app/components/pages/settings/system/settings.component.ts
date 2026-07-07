import {Component, OnInit} from '@angular/core';
import {ComponentTemplate} from '../../../../service/ComponentTemplate';
import {DeveloperService} from '../../../../service/developer.service';
import {LoaderService} from '../../../../service/loader.service';
import {LockpageService} from "../../lockpage/lockpage.service";
import {Router} from "@angular/router";
import {AlertsService, AlertState} from "../../../../service/alerts.service";

@Component({
  selector: 'app-settings-system',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})

export class SystemSettingsComponent extends ComponentTemplate implements OnInit {

  confirmReset = false;
  utc = +localStorage.getItem('utc');
  autoLock = true;
  pinSet = false;

  constructor(public developerService: DeveloperService, private loader: LoaderService,
              private lockService: LockpageService, private router: Router,
              private alertService: AlertsService) {
    super();
  }

  async ngOnInit(): Promise<void> {

    this.pinSet = this.isPinSet();
    const autoLock = localStorage.getItem('MyShip.AutoLock');
    if (autoLock == null) {
      localStorage.setItem('MyShip.AutoLock', '0');
      this.autoLock = false;
    } else {
      this.autoLock = autoLock === '1';
    }

    if (localStorage.getItem('utc') == null) {
      localStorage.setItem('utc', '0');
      this.utc = 0;
    }
  }

  async reset(): Promise<void> {
    localStorage.clear();
    window.location.reload();
  }

  async reload(): Promise<void> {
    window.location.reload();
  }

  addUTC(): void {
    this.utc += 1;
    localStorage.setItem('utc', this.utc + '');
  }

  removeUTC(): void {
    this.utc -= 1;
    localStorage.setItem('utc', this.utc + '');
  }

  setAutoLock(): void {
    localStorage.setItem('MyShip.AutoLock', this.autoLock ? '1' : '0');
  }

  async lock(): Promise<void> {
    this.lockService.locked = true;
    await this.router.navigate(['/lock']);
  }

  deletePinOfLockService(): void {
    localStorage.setItem('MyShip.Password', null);
    this.pinSet = false;
    this.alertService.alert(AlertState.Success, 'Der PIN wurde erfolgreich gelöscht.');
  }

  isPinSet(): boolean {
    return localStorage.getItem('MyShip.Password') != null;
  }

}

