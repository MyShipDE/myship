import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {HttpService} from './http.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient,
              private httpService: HttpService) {
  }

  checkAuth(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.http
        .get(this.httpService.api + '/client', this.httpService.options)
        .subscribe(() => resolve(true), () => resolve(false));
    });
  }

  auth(token: string): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.http
        .post(this.httpService.api + '/login', {
          token
        }, this.httpService.options)
        .subscribe(() => resolve(true), err => resolve(false));
    });
  }
}
