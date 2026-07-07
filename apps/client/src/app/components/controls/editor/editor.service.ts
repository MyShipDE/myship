import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';

@Injectable()
export class EditorService {

  visibility = false;

  text = '';
  value = '';

  applyChanges: Subject<boolean> = new Subject<boolean>();

  constructor() {
    //
  }

  async openModal(text: string, value: string): Promise<string> {
    return new Promise<string>(resolve => {

      this.text = text;
      this.value = value;
      this.visibility = true;

      this.applyChanges.subscribe(result => {
        this.visibility = false;
        if (result) {
          resolve(this.value);
        } else {
          resolve(value);
        }
      });

    });
  }

}
