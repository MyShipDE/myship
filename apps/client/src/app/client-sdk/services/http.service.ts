import { HttpHeaders } from '@angular/common/http';
import {Injectable} from '@angular/core';

@Injectable()
export class HttpService {

  options: {
    headers: HttpHeaders
  };
  readonly protocol = 'http://';

  api?: string;

  constructor() {
    this.setApi();
  }


  setApi(): void {

    let uuid: string;
    if (localStorage.getItem('MyShip.Client.UID') == null) {
      uuid = this.getID();
      localStorage.setItem('MyShip.Client.UID', uuid);
    } else {
      // tslint:disable-next-line:no-non-null-assertion
      uuid = localStorage.getItem('MyShip.Client.UID')!;
    }

    this.options = {
      headers: new HttpHeaders({
        Authorization: uuid
      })
    };

    const serverUrl = localStorage.getItem('MyShip.ServerUrl');
    if (serverUrl != null && serverUrl !== '') {
      this.api = this.protocol + serverUrl;
    }
  }

  random(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    return result;
  }

  getID(): string {
    return this.random(8) + '-' + this.random(16) + '-' + this.random(12);
  }

}
