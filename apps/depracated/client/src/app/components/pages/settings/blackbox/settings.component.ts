import {Component, OnInit} from '@angular/core';
import {ComponentTemplate} from '../../../../service/ComponentTemplate';
import {ManualInput, ManualInputType} from '../../../../client-sdk/models/ManualInput';
import {TemplateVDR} from '../../../../client-sdk/models/TemplateVDR';
import { HttpClient } from '@angular/common/http';
import {HttpService} from '../../../../client-sdk/services/http.service';
import {TemplateVDRService} from '../../../../client-sdk/services/templateVDR.service';
import {LoaderService} from '../../../../service/loader.service';
import {AlertsService, AlertState} from "../../../../service/alerts.service";

@Component({
  selector: 'app-settings-blackbox',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})

export class BlackBoxSettingsComponent extends ComponentTemplate implements OnInit {

  manualInputs: Array<ManualInput> = [];
  types: Array<ManualInputType> = [];
  visibleManualInputs: Array<ManualInput> = [];
  selectedTypeID = 0;
  newTypeName: string;

  isDirty = false;
  selectedTemplate: TemplateVDR = new TemplateVDR();

  templates: TemplateVDR[] = [];

  constructor(private templateService: TemplateVDRService,
              private http: HttpClient,
              private httpService: HttpService,
              private loader: LoaderService,
              private alertService: AlertsService) {
    super();
  }

  async ngOnInit(): Promise<void> {
    this.loader.startLoading();
    await this.loadManualInputs();
    this.templates = await this.templateService.GetTemplates();
    this.setSelectedTemplate();
    this.loader.stopLoading();
  }

  setSelectedTemplate(): void {
    this.selectedTemplate = this.templates.find(x => x.active);
  }

  selectTemplate(template: TemplateVDR): void {
    this.templates.map(x => x.active = false);
    template.active = true;
    this.isDirty = true;
    this.setSelectedTemplate();
  }

  async save(template: TemplateVDR): Promise<void> {
    if (await this.templateService.saveTemplate(template)) {
      this.isDirty = false;
    } else {
      this.alertService.alert(AlertState.Error, 'Die Vorlage konnte nicht gespeichert werden.');
    }
  }

  async withdraw(): Promise<void> {
    this.templates = await this.templateService.GetTemplates();
    this.setSelectedTemplate();
    this.isDirty = false;
  }

  loadManualInputs(): Promise<void> {
    return new Promise(resolve => {
      this.http
        .get<ManualInput[]>(this.httpService.api + '/logbook/manualInputs', this.httpService.options)
        .subscribe((result: ManualInput[]) => {
          this.manualInputs = result;
        });
      this.http
        .get<ManualInputType[]>(this.httpService.api + '/logbook/manualInputs/types', this.httpService.options)
        .subscribe((result: ManualInputType[]) => {
          this.types = result;
        });
      resolve();
    });
  }

  filter(): void {
    this.visibleManualInputs = this.manualInputs.filter(x => x.typeId === +this.selectedTypeID);
  }

  addManualInput(): void {
    this.http
      .post(this.httpService.api + '/logbook/manualInput', {
        type_id: this.selectedTypeID,
        name: this.newTypeName
      }, this.httpService.options)
      .subscribe(() => {
        this.newTypeName = '';
        this.loadManualInputs();
      });
  }

  deleteManualInput(id: number): void {
    this.http
      .delete(this.httpService.api + '/logbook/manualInput/' + id, this.httpService.options)
      .subscribe(() => {
        this.loadManualInputs();
      });
  }

  convertSecondsToMinutesAndHours(seconds: number): { minutes: number, hours: number } {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return {minutes: minutes % 60, hours};
  }

}

