import {Component, EventEmitter, Output} from '@angular/core';
import {NightModeService} from '../../../client-sdk/services/nightMode.service';
import {AvNavService} from '../../../service/AvNav.service';
import {Router} from '@angular/router';
import $ from 'jquery';
import {MenuItem} from '../../../models/MenuItem';
import {CustomRecordService} from '../../../client-sdk/services/customRecord.service';
import {SecurityQueryService} from "../../../service/securityQuery.service";
import {Resource} from "../../../Resource";
import {SecurityQueryResult} from "../../controls/securityQuery/securityQuery.component";
import {LoaderService} from "../../../service/loader.service";
import {Subject} from "rxjs";

@Component({
  selector: 'app-categories',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})

export class HomeComponent {

  @Output() MainControlModalEvent: EventEmitter<void> = new EventEmitter<void>();
  MainControlOpenSubject: Subject<void> = new Subject<void>();

  nav: Array<MenuItem> = [];
  ShowStateModal = false;
  ShowMainControlModal = false;

  constructor(private customRecordService: CustomRecordService,
              private avNavService: AvNavService,
              private router: Router,
              public nightModeService: NightModeService,
              private securityQueryService: SecurityQueryService,
              private loader: LoaderService) {
    this.nav = MenuItem.getMainMenuElements();
  }

  async setNightMode(): Promise<void> {
    this.loader.startLoading();
    const state = await this.nightModeService.getState();
    this.loader.stopLoading();
    const query = await this.securityQueryService.show(state ? Resource.NightModeDeactivateSecurityQuery : Resource.NightModeActivateSecurityQuery, true, true, false) === SecurityQueryResult.Yes;
    this.loader.startLoading();
    if (state && query) {
      await this.nightModeService.setState(false);
    } else if (query) {
      await this.nightModeService.setState(true);
    }
    this.loader.stopLoading();
  }

  ToggleStateModal(): void {
    this.ShowStateModal = !this.ShowStateModal;
    if (this.ShowStateModal) {
      $('.header-space').css('filter', 'blur(0.25rem)');
      $('.nav-container').css('filter', 'blur(0.25rem)');
      $('.dashboard').css('filter', 'blur(0.25rem)');
    } else {
      $('.header-space').css('filter', 'blur(0)');
      $('.nav-container').css('filter', 'blur(0)');
      $('.dashboard').css('filter', 'blur(0)');
    }
  }

  ToggleMainControlModal(): void {
    this.ShowMainControlModal = !this.ShowMainControlModal;
    this.MainControlOpenSubject.next();
    if (this.ShowMainControlModal) {
      $('.home-main-grid').css('filter', 'blur(0.25rem)');
    } else {
      $('.home-main-grid').css('filter', 'blur(0)');
    }
  }

  OpenLogbookReminder(): void {
    this.customRecordService.setVisibility(true);
  }

  async NavActionPerform(menuItem: MenuItem): Promise<void> {
    if (menuItem.link === '/avnav') {
      this.avNavService.setVisibility(true);
      $('.avNav-wrapper').fadeIn();
    } else {
      await this.router.navigate([menuItem.link]);
    }
  }

}
