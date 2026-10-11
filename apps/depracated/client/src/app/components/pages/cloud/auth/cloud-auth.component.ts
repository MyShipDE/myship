import {Component, OnInit} from '@angular/core';
import {AlertsService, AlertState} from '../../../../service/alerts.service';
import {Router} from '@angular/router';
import {Resource} from '../../../../Resource';
import {CoreService} from '../../../../service/core.service';
import {CloudAuthService} from "../../../../client-sdk/services/cloud-auth.service";

@Component({
  selector: 'app-cloud-auth',
  templateUrl: './cloud-auth.component.html',
  styleUrls: ['./cloud-auth.component.scss']
})
export class CloudAuthComponent implements OnInit {

  private readonly cloudAccountRoute = '/cloud/account';

  username = '';
  password = '';

  pw1 = '';
  pw2 = '';

  securityCode = '';

  loginFormVisibility = true;
  reqPasswordFormVisibility = false;
  setPasswordFormVisibility = false;

  connected = false;

  constructor(private cloudAuthService: CloudAuthService,
              private alertService: AlertsService,
              private router: Router,
              private coreService: CoreService) {
    //
  }

  async ngOnInit(): Promise<void> {
    this.connected = await this.coreService.isConnectedAndAuthorized();
    try {
      await this.cloudAuthService.checkSession();
      await this.router.navigate([this.cloudAccountRoute]);
    } catch (e) {
      //
    }
  }

  async login(): Promise<void> {

    if (this.username == null || this.username === '') {
      return this.alertService.alert(AlertState.Error, Resource.CloudAuthUsernameEmpty);
    }

    if (this.password == null || this.password === '') {
      return this.alertService.alert(AlertState.Error, Resource.CloudAuthPasswordEmpty);
    }

    localStorage.setItem('MyShip.Username', this.username);

    if (await this.cloudAuthService.login(this.username, this.password, true)) {
      await this.router.navigate([this.cloudAccountRoute]);
    } else {
      return this.alertService.alert(AlertState.Error, Resource.CloudAuthFailed);
    }

  }

  async requestSecurityCode(): Promise<void> {

    if (this.username == null || this.username === '') {
      return this.alertService.alert(AlertState.Error, Resource.CloudAuthUsernameEmpty);
    }

    if (await this.cloudAuthService.passwordResetRequest(this.username)) {
      this.openSetPasswordForm();
    } else {
      return this.alertService.alert(AlertState.Error, Resource.CloudAuthReqPasswordFailed);
    }

  }

  async setPassword(): Promise<void> {

    if (this.username == null || this.username === '') {
      return this.alertService.alert(AlertState.Error, Resource.CloudAuthUsernameEmpty);
    }

    if (this.securityCode == null || this.securityCode === '') {
      return this.alertService.alert(AlertState.Error, Resource.CloudAuthSecurityCodeEmpty);
    }

    let securityCode;
    try {
      securityCode = +this.securityCode;
    } catch (e) {
      return this.alertService.alert(AlertState.Error, Resource.CloudAuthSecurityCodeValidationFailed);
    }

    if (this.pw1 == null || this.pw1 === '') {
      return this.alertService.alert(AlertState.Error, Resource.CloudAuthPassword1Empty);
    }

    if (this.pw2 == null || this.pw2 === '') {
      return this.alertService.alert(AlertState.Error, Resource.CloudAuthPassword2Empty);
    }

    if (this.pw1 !== this.pw2) {
      return this.alertService.alert(AlertState.Error, Resource.CloudAuthNewPasswordsNotMatched);
    }

    if (await this.cloudAuthService.passwordReset(this.username, securityCode, this.pw1)) {
      this.clearForms();
      this.openLoginForm();
    } else {
      return this.alertService.alert(AlertState.Error, Resource.CloudAuthReqPasswordFailed);
    }

  }

  clearForms(): void {
    this.username = '';
    this.password = '';
    this.pw1 = '';
    this.pw2 = '';
  }

  openLoginForm(): void {
    this.loginFormVisibility = true;
    this.reqPasswordFormVisibility = false;
    this.setPasswordFormVisibility = false;
  }

  openReqPasswordForm(): void {
    this.loginFormVisibility = false;
    this.reqPasswordFormVisibility = true;
    this.setPasswordFormVisibility = false;
  }

  openSetPasswordForm(): void {
    this.loginFormVisibility = false;
    this.reqPasswordFormVisibility = false;
    this.setPasswordFormVisibility = true;
  }

}
