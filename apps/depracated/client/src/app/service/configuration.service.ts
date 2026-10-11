import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {HttpService} from '../client-sdk/services/http.service';

@Injectable()
export class ConfigurationService {

  constructor(private http: HttpClient,
              private httpService: HttpService) {
  }

  isLocal(): boolean {
    const serverUrl = localStorage.getItem('MyShip.ServerUrl');
    if (serverUrl == null) return false;
    return serverUrl.includes('127.0.0.1') || serverUrl.includes('localhost');
  }

  async GetFromSettings(token: string): Promise<string | boolean> {
    return new Promise<string | boolean>(resolve => {
      this.http
        .get(this.httpService.api + '/storage/' + token, this.httpService.options)
        .subscribe((result: any) => resolve(result.value), () => resolve(false));
    });
  }

  tryConnect(host: string): Promise<boolean> {
    return new Promise<boolean>(async resolve => {
      let timeout: NodeJS.Timeout = null;
      const req = this.http
        .get(this.httpService.protocol + host + '/test')
        .subscribe(() => {
          clearTimeout(timeout);
          resolve(true);
        }, () => {
          clearTimeout(timeout);
          resolve(false);
        });

      timeout = setTimeout(() => {
        req.unsubscribe();
        resolve(false);
      }, 6000);
    });
  }

}
