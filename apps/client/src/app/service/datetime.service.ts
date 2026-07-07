import {Injectable} from '@angular/core';
import {ConvertingService} from "./converting.service";

@Injectable()
export class DatetimeService {

  constructor(private converter: ConvertingService) {
  }

  getDifferenceInMinutes(startDate: Date, endDate: Date): number {
    const diffInMs = endDate.getTime() - startDate.getTime();
    return diffInMs / 1000 / 60;
  }

  minutesToHoursAndMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = this.converter.round(minutes % 60, 0);
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days > 0 ? days + 'T : ' : ''}${remainingHours > 0 ? remainingHours + 'h : ' : ''}${remainingMinutes}m`;
    /*if (hours > 0 && minutes > 0) {
      return `${hours} Stunden und ${remainingMinutes} Minuten`;
    } else if (hours === 0 && minutes > 0) {
      return `${remainingMinutes} Minuten`;
    } else if (hours > 0 && minutes === 0) {
      return `${hours} Stunden`;
    } else {
      return '-';
    } */
  }

}
