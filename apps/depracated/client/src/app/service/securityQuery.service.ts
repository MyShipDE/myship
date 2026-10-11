import {Injectable} from '@angular/core';
import {SecurityQueryResult} from '../components/controls/securityQuery/securityQuery.component';
import {Observable, Subject} from "rxjs";

@Injectable()
export class SecurityQueryService {

  visibility = false;

  yesButton = true;
  noButton = true;
  cancelButton = true;

  text = '';

  resultSubject: Subject<SecurityQueryResult> = new Subject<SecurityQueryResult>();
  result: SecurityQueryResult = null;

  constructor() {
  }

  setResult(result: SecurityQueryResult): void {
    this.result = result;
    this.resultSubject.next(result);
  }

  async show(text: string, yesButton: boolean, noButton: boolean, cancelButton: boolean): Promise<SecurityQueryResult> {
    return new Promise<SecurityQueryResult>(resolve => {

      this.yesButton = yesButton;
      this.noButton = noButton;
      this.cancelButton = cancelButton;
      this.text = text;
      this.visibility = true;

      this.resultSubject.subscribe(result => {
        this.visibility = false;
        resolve(result);
      });

    });
  }

}
