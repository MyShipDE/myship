import {Injectable} from '@angular/core';
import {ComponentTemplateService} from './ComponentTemplate.service';

@Injectable({
  providedIn: 'root'
})
export class QRScannerService extends ComponentTemplateService {

  identifier: string;

  constructor() {
    super();
  }

}
