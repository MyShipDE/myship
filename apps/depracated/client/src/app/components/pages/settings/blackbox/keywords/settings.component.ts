import {Component, OnInit} from '@angular/core';
import {ComponentTemplate} from '../../../../../service/ComponentTemplate';
import {LoaderComponent} from '../../../../controls/loader/loader.component';
import {ManualInput, ManualInputType} from '../../../../../client-sdk/models/ManualInput';
import { HttpClient } from '@angular/common/http';
import {HttpService} from '../../../../../client-sdk/services/http.service';
import {LoaderService} from '../../../../../service/loader.service';

@Component({
  selector: 'app-settings-keywords-blackbox',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})

export class BlackBoxKeywordsSettingsComponent extends ComponentTemplate implements OnInit {

  manualInputs: Array<ManualInput> = [];
  types: Array<ManualInputType> = [];
  visibleManualInputs: Array<ManualInput> = [];
  selectedTypeID = 0;
  newTypeName: string;

  constructor(private http: HttpClient, private httpService: HttpService,
              private loader: LoaderService) {
    super();
  }

  async ngOnInit(): Promise<void> {
    this.loadManualInputs();
  }

  loadManualInputs(): void {
    this.http
      .get<ManualInput[]>(this.httpService.api + '/logbook/manualInputs', this.httpService.options)
      .subscribe((result: ManualInput[]) => {
        this.manualInputs = result;
        this.filter();
      });
    this.http
      .get<ManualInputType[]>(this.httpService.api + '/logbook/manualInputs/types', this.httpService.options)
      .subscribe((result: ManualInputType[]) => {
        this.types = result;
      });
  }

  filter(): void {
    if (this.selectedTypeID !== 0) {
      this.visibleManualInputs = this.manualInputs.filter(x => +x.typeId === +this.selectedTypeID);
    }
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
    this.loader.startLoading();
    this.http
      .delete(this.httpService.api + '/logbook/manualInput/' + id, this.httpService.options)
      .subscribe(() => {
        this.loadManualInputs();
        this.loader.stopLoading();
      }, error => this.loader.stopLoading());
  }

}

