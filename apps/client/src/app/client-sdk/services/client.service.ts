import { HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Client} from '../models/Client';
import {HttpService} from './http.service';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor(private http: HttpClient,
              private httpService: HttpService) {
  }

  get(): Promise<Client[]> {
    return new Promise<Client[]>(resolve => {
      this.http
        .get<Client[]>(this.httpService.api + '/clients', this.httpService.options)
        .subscribe(x => resolve(x), () => resolve([]));
    });
  }

  self(): Promise<Client | null> {
    return new Promise<Client | null>(resolve => {
      this.http
        .get<Client>(this.httpService.api + '/client', this.httpService.options)
        .subscribe(x => resolve(x), () => resolve(null));
    });
  }

  isAuth(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.http
        .get<Client>(this.httpService.api + '/client', this.httpService.options)
        .subscribe(x => resolve(true), () => resolve(false));
    });
  }

  login(token: string): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.http
        .post(this.httpService.api + '/login', {
          token
        }, this.httpService.options)
        .subscribe(x => resolve(true), () => resolve(false));
    });
  }

  create(token: string, comment: string, isAdmin: boolean): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.http
        .post(this.httpService.api + '/client', {
          token,
          comment,
          isAdmin: isAdmin ? '1' : null
        }, this.httpService.options)
        .subscribe(x => resolve(true), () => resolve(false));
    });
  }

  delete(client: Client): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.http
        .delete(this.httpService.api + '/client/' + client.id, this.httpService.options)
        .subscribe(x => resolve(true), () => resolve(false));
    });
  }

}
