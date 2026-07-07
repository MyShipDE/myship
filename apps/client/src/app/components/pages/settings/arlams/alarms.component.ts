import {Component, OnInit} from '@angular/core';
import {ComponentTemplate} from '../../../../service/ComponentTemplate';
import {CoreService} from '../../../../service/core.service';
import {AlertsService, AlertState} from '../../../../service/alerts.service';
import {LoaderComponent} from '../../../controls/loader/loader.component';
import {UnitService} from '../../../../service/unit.service';
import {Alarm} from '../../../../client-sdk/models/Alarm';
import {SignalKDatasource} from '../../../../client-sdk/models/SignalKDatasource';
import {AlarmService} from '../../../../client-sdk/services/alarm.service';
import {LoaderService} from '../../../../service/loader.service';

@Component({
  selector: 'app-alarm-settings',
  templateUrl: './alarms.component.html',
  styleUrls: ['./alarms.component.scss']
})

export class AlarmsComponent extends ComponentTemplate implements OnInit {

  isDirty = false;
  newAlarm = false;

  emailField = false;
  telField = false;

  alarms: Alarm[];
  selectedAlarm: Alarm;

  minValue: number;
  maxValue: number;

  selectedSensorId: number;
  sensors: SignalKDatasource[];

  constructor(public service: AlarmService, public unit: UnitService,
              private core: CoreService, private alertService: AlertsService,
              private loader: LoaderService) {
    super();
  }

  async ngOnInit(): Promise<void> {
    this.alarms = await this.service.get();
    this.sensors = await this.service.getSensors();
  }

  async selectAlarm(alarm: Alarm): Promise<void> {
    this.selectedAlarm = alarm;

    this.selectedSensorId = alarm.signalKDatasource.id;
    this.minValue = Math.round(this.unit.convert(alarm.minValue, alarm.signalKDatasource.unit).value);
    this.maxValue = Math.round(this.unit.convert(alarm.maxValue, alarm.signalKDatasource.unit).value);

    this.emailField = this.selectedAlarm.email != null && this.selectedAlarm.email !== '';
    this.telField = this.selectedAlarm.phone != null && this.selectedAlarm.phone !== '';

    if (this.isDirty) {
      this.loader.startLoading();
      await this.ngOnInit();
      this.isDirty = false;
      this.loader.stopLoading();
    }
  }

  convertSecondsToMinutesAndHours(seconds: number): { minutes: number, hours: number } {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return {minutes: minutes % 60, hours};
  }

  async createBlank(): Promise<void> {
    this.newAlarm = true;
    const blank = new Alarm();
    blank.active = false;
    blank.phone = this.getCachedPhone();
    blank.email = this.getCachedMail();
    blank.signalKDatasource = new SignalKDatasource();
    blank.signalKDatasource.id = 0;
    await this.selectAlarm(blank);
  }

  async save(): Promise<void> {
    this.loader.startLoading();
    if (await this.service.save(this.selectedAlarm)) {
      this.alertService.alert(AlertState.Success, 'Die Änderungen wurden gespeichert.');
      if (this.newAlarm) {
        this.newAlarm = false;
      }
    } else {
      this.alertService.alert(AlertState.Error, 'Die Änderungen konnten nicht gespeichert werden.');
    }
    await this.ngOnInit();
    this.isDirty = false;
    this.selectedAlarm = null;
    this.loader.stopLoading();
  }

  async delete(): Promise<void> {
    this.isDirty = false;
    this.loader.startLoading();
    if (await this.service.remove(this.selectedAlarm)) {
      this.alertService.alert(AlertState.Success, 'Die Warnung wurde gelöscht.');
      await this.ngOnInit();
    } else {
      this.alertService.alert(AlertState.Error, 'Die Warnung konnte nicht gelöscht werden.');
    }
    this.selectedAlarm = null;
    this.loader.stopLoading();
  }

  minValueChanged(): void {
    console.log(this.minValue);
    if (this.minValue != null) {
      this.isDirty = true;
      this.selectedAlarm.minValue = this.unit.convertBack(this.minValue, this.selectedAlarm.signalKDatasource.unit).value;
    }
  }

  maxValueChanged(): void {
    if (this.maxValue != null) {
      this.isDirty = true;
      this.selectedAlarm.maxValue = this.unit.convertBack(this.maxValue, this.selectedAlarm.signalKDatasource.unit).value;
    }
  }

  sensorChanged(id: number): void {
    // tslint:disable-next-line:triple-equals
    this.selectedAlarm.signalKDatasource = this.sensors.find(x => x.id == id);
    this.isDirty = true;
  }

  cacheMail(mail: string): void {
    localStorage.setItem('MyShip.Cache.Mail', mail);
  }

  cachePhone(phone: string): void {
    localStorage.setItem('MyShip.Cache.Phone', phone);
  }

  getCachedMail(): string {
    const saved = localStorage.getItem('MyShip.Cache.Mail');
    return saved != null ? saved : '';
  }

  getCachedPhone(): string {
    const saved = localStorage.getItem('MyShip.Cache.Phone');
    return saved != null ? saved : '';
  }

}
