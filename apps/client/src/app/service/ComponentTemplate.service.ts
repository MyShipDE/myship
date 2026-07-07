import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ComponentTemplateService {

  private visibility = false;

  constructor() {
    //
  }

  setVisibility(visibility: boolean): void {
    this.visibility = visibility;
  }

  getVisibility(): boolean {
    return this.visibility;
  }

}

