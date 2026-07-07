import { HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {HttpService} from './http.service';
import {TemplateVDR} from '../models/TemplateVDR';

@Injectable({
  providedIn: 'root'
})
export class TemplateVDRService {

  constructor(private http: HttpClient,
              private httpService: HttpService) {
  }

  GetTemplates(): Promise<TemplateVDR[]> {
    return new Promise(resolve => {
      this.http.get<TemplateVDR[]>(this.httpService.api + '/api/vdr/templates', this.httpService.options)
        .subscribe(templates => resolve(templates), () => resolve([]));
    });
  }

  saveTemplate(template: TemplateVDR): Promise<boolean> {
    return new Promise(resolve => {
      this.http.put(this.httpService.api + '/api/vdr/template', template, this.httpService.options)
        .subscribe(() => resolve(true), () => resolve(false));
    });
  }

}
