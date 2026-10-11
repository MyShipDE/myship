import {Component, Input, OnInit} from '@angular/core';
import {SecurityQueryService} from '../../../service/securityQuery.service';

@Component({
  selector: 'app-security-query',
  templateUrl: './securityQuery.component.html',
  styleUrls: ['./securityQuery.component.scss']
})
export class SecurityQueryComponent {

  constructor(public service: SecurityQueryService) {
  }

  // tslint:disable-next-line:typedef
  get result() {
    return SecurityQueryResult;
  }

}

export enum SecurityQueryResult {
  Yes,
  No,
  Cancel
}
