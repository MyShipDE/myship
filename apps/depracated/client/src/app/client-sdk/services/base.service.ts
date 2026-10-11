import {Injectable} from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {catchError, EMPTY, Observable} from 'rxjs';
import {HostService} from './host.Service';
import {AlertsService, AlertState} from '../../service/alerts.service';

@Injectable()
export class BaseService {

  selectedGateway = -1;
  progress = -1;

  get url(): string {
    return this.hostService.buildUrl();
  }

  // tslint:disable-next-line:typedef
  get httpOptions() {
    return {
      headers: {
        Authorization: this.getAuthorizationToken(),
        'X-Gateway-Identifier': this.selectedGateway > 0 ? this.selectedGateway.toString() : ''
      }
    };
  }

  constructor(private alertService: AlertsService,
              private hostService: HostService,
              protected http: HttpClient) {
    //
  }

  executeRequest<T>(path: string, method: HttpMethod, body: any = {}, extendedOptions: boolean = false, responseType?: string): Promise<T> {
    const url = path.startsWith('http') ? path : `${this.url}${path}`;
    return new Promise<T>((resolve, reject) => {
      this.executeRequestGetObserver<T>(url, method, body, reject, !path.startsWith('http'), extendedOptions, responseType)
        .subscribe((result: T) => {
          resolve(result);
        });
    });
  }

  // tslint:disable-next-line:max-line-length typedef
  executeRequestGetObserver<T>(url: string, method: HttpMethod, body: any = {}, reject: () => void, withOptions: boolean = true, withExtendedOptions: boolean = false, responseType?: string) {
    return this.getBaseRequest<T>(url, method, body, withOptions, withExtendedOptions, responseType)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.handleError(error);
          reject();
          return EMPTY;
        })
      );
  }

  private getBaseRequest<T>(url: string, httpMethod: HttpMethod, body: any = {}, withOptions: boolean = true, withExtendedOptions: boolean, responseType?: string): Observable<T> {
    // console.debug(`Request: ${url}, Method: ${HttpMethod[httpMethod]}, withOptions: ${withOptions}, withExtendedOptions: ${withExtendedOptions}`);
    const extendedOptions = {
      ...this.httpOptions,
      reportProgress: true,
      observe: 'events'
    };
    const options = withExtendedOptions ? extendedOptions : withOptions ? {
      ...this.httpOptions,
      responseType
    } : {};

    switch (httpMethod) {
      case HttpMethod.GET:
        return this.http.get<T>(url, options);
      case HttpMethod.POST:
        return this.http.post<T>(url, body, options);
      case HttpMethod.PUT:
        return this.http.put<T>(url, body, options);
      case HttpMethod.PATCH:
        return this.http.patch<T>(url, body, options);
      case HttpMethod.DELETE:
        return this.http.delete<T>(url, options);
    }
  }

  handleError(error: HttpErrorResponse): void {
    if (!(error.error instanceof Error)) {
      if (error.error?.description_de != null) {
        this.alertService.alert(AlertState.Error, error.error?.description_de);
        console.error(error.error?.description_de);
      } else if (error.error?.errors != null) {
        let message = '';
        error.error?.errors.forEach((x: { description: string }) => {
          if (message !== '') {
            message += '<br>';
          }
          message += x.description;
        });
        this.alertService.alert(AlertState.Error, message);
        console.error(message);
      } else if (error.url != null && error.status !== 0) {
        const message = `Fehler beim Aufruf von ${error.url} (${error.status}).`;
        // this.alertService.show(message, 8000);
        console.error(`[MyShip] ${message}`);
        console.error(error);
      }
    }
  }

  getAuthorizationToken(): string {
    let token = localStorage.getItem('sessionID');
    if (token == null) {
      token = sessionStorage.getItem('sessionID');
      if (token == null) {
        token = '';
      }
    }
    return token;
  }

}

export enum HttpMethod {
  GET,
  POST,
  PUT,
  PATCH,
  DELETE
}
