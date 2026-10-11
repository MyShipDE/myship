import {Injectable} from '@angular/core';

@Injectable()
export class LoaderService {

  status = false;

  private RestartTimeout: NodeJS.Timeout;

  constructor() {
    //
  }

  startLoading(timeout: number = 60000): void {
    this.RestartTimeout = setTimeout(async () => {
      // await this.break();
    }, timeout);

    this.status = true;
  }

  stopLoading(): void {
    this.status = false;
    clearTimeout(this.RestartTimeout);
  }

  async break(): Promise<void> {
    this.status = false;
    window.open('/');
  }

}
