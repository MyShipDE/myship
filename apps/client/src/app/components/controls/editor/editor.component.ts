import {Component, Input, OnInit} from '@angular/core';
import {EditorService} from './editor.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent {

  constructor(public service: EditorService) {
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
