import {environment} from '../../environments/environment';
import convertGrade from 'convert-grades';

export class Helper {
  static playHuston(): void {
    const audio = new Audio();
    audio.src = environment.huston;
    audio.load();
    audio.play();
  }

  static getHuston(): HTMLAudioElement {
    const audio = new Audio();
    audio.src = environment.huston;
    audio.load();
    return audio;
  }

  static playPing(): void {
    const audio = new Audio();
    audio.src = environment.ping;
    audio.load();
    audio.play();
  }

  static sleep(milliseconds): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  static calcCelsius(x: number): number {
    return convertGrade(x, 'k', 'c');
  }

  static convertCoordinates(lat: number, lon: number): Array<string> {
    let latString: string = lat + '';
    let lonString: string = lon + '';
    latString = latString.split('.')[0];
    lonString = lonString.split('.')[0];

    const latGrad: number = +latString;
    let x: number = (lat - latGrad) * 60;
    const latMinute: number = (Math.round(x * 1000) / 1000);

    const lonGrad: number = +lonString;
    x = (lon - lonGrad) * 60;
    const lonMinute: number = (Math.round(x * 1000) / 1000);

    return [latGrad + '° ' + latMinute + '\' N', lonGrad + '° ' + lonMinute + '\' E'];
  }

  async sleep(ms: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }

}
