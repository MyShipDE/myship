import {Injectable} from "@angular/core";

@Injectable()
export class HostService {

  public host?: string;
  public port?: number;
  public protocol?: string;
  public path?: string;

  buildUrl(override = false, host: string = '127.0.0.1', port: number = 443, protocol: string = 'https', path: string = '/api/v1') {

    if (override) {
      this.host = host;
      this.port = port;
      this.protocol = protocol;
      this.path = path;
    }

    return this.protocol + '://' + this.host + ':' + this.port + this.path;
  }

}
