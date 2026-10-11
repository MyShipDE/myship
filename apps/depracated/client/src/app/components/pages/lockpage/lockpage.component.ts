import {Component, OnInit} from '@angular/core';
import {AlertsService, AlertState} from "../../../service/alerts.service";
import {Router} from "@angular/router";
import {LockpageService} from "./lockpage.service";

@Component({
  selector: 'app-lock-page',
  templateUrl: './lockpage.component.html',
  styleUrls: ['./lockpage.component.scss']
})
export class LockpageComponent implements OnInit {

  title = 'Bitte Pin eingeben';
  inputPassword = '';
  tempPassword = '';
  error = false;
  success = false;

  constructor(private alertService: AlertsService,
              private router: Router,
              private service: LockpageService) {
    //
  }

  async ngOnInit(): Promise<void> {
    const password = localStorage.getItem('MyShip.Password');

    if (password == null || password === 'null') {
      this.title = 'Bitte einen Pin setzen';
    } else {
      this.title = 'Bitte Pin eingeben';
    }
  }

  async enterNumber(clickedNumber: string): Promise<void> {

    this.success = false;
    this.error = false;

    if (this.inputPassword.length >= 3) {
      this.inputPassword += clickedNumber;

      if (this.tempPassword !== '') {
        if (this.tempPassword === this.inputPassword) {
          localStorage.setItem('MyShip.Password', this.inputPassword);
          this.alertService.alert(AlertState.Success, 'Die PIN wurde erfolgreich gesetzt!');
          this.tempPassword = '';
          this.inputPassword = '';
          this.title = 'Bitte Pin eingeben';
          return;
        }
      }

      const password = localStorage.getItem('MyShip.Password');

      console.log(password);

      if (password == null || password === 'null') {
        this.tempPassword = this.inputPassword;
        this.inputPassword = '';
        this.title = 'Bitte Pin wiederholen';
        return;
      }

      if (password === this.inputPassword) {
        this.success = true;
        this.inputPassword = '';
        this.service.locked = false;
        await this.router.navigate(['/welcome']);
        return;
      } else {
        this.error = true;
        this.inputPassword = '';
        return;
      }

    } else if (this.inputPassword.length < 4) {
      this.inputPassword += clickedNumber;
    }
  }

  getClassOfNumber(targetNumber: number): string {
    if (this.error) {
      return 'error';
    } else if (this.success) {
      return 'success';
    } else if (this.inputPassword.length > targetNumber) {
      return 'selected';
    }
  }

}
