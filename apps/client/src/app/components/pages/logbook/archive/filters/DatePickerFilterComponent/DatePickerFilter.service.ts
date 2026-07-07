import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable()
export class DatePickerFilterService {
  visibility = false;
  dateSelection: Subject<string> = new Subject<string>();

  selectDate(): Promise<string> {
    return new Promise<string>(resolve => {
      this.visibility = true;
      this.dateSelection.subscribe((date: string) => {
        this.visibility = false;
        resolve(date);
      });
    });
  }

}
