import {Injectable} from '@angular/core';
import {ComponentTemplateService} from './ComponentTemplate.service';

@Injectable({
  providedIn: 'root'
})
export class PreviewRouteService extends ComponentTemplateService {

  constructor() {
    super();
  }

}

