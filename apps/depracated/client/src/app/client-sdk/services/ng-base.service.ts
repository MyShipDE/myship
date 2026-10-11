import {Injectable} from "@angular/core";

@Injectable()
export class NgBaseService {
  visibility: boolean = false;

  setVisibility(value: boolean) {
    this.visibility = value;
  }

  getVisibility() {
    return this.visibility;
  }
}
