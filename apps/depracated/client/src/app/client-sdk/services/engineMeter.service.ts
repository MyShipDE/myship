import { HttpClient } from '@angular/common/http';
import {HttpService} from './http.service';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EngineMeterService {

  constructor(private http: HttpClient,
              private httpService: HttpService) {
  }

  getSeconds(): Promise<number> {
    return new Promise<number>(resolve => {
      this.http
        .get<IEngineMeterResult>(this.httpService.api + '/engine/hours', this.httpService.options)
        .subscribe((result) => {
          resolve(result.durationInSeconds);
        }, () => resolve(0));
    });
  }

  getSecondsByDay(): Promise<number> {
    return new Promise<number>(resolve => {
      this.http
        .get<IEngineMeterResult>(this.httpService.api + '/engine/hours/day', this.httpService.options)
        .subscribe((result) => {
          resolve(result.durationInSeconds);
        }, () => resolve(0));
    });
  }

}

export interface IEngineMeterResult {
  durationInSeconds: number;
}
