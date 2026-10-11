export class DateHelper {

  static convertToDate(timestamp: string): string {
    if (timestamp != null) {
      const timestampArr = timestamp.split('T');
      const date = timestampArr[0];
      const dateArr = date.split('-');
      const year = dateArr[0];
      const month = dateArr[1];
      const day = dateArr[2];
      return day + '.' + month + '.' + year;
    } else {
      return null;
    }
  }

  static convertToTime(timestamp: string, seconds: boolean = true): string {
    const utc: number = +localStorage.getItem('utc');

    if (timestamp != null) {
      const timestampArr = timestamp.split('T');
      let time = timestampArr[1];
      if (seconds) {
        return time.split('.')[0];
      } else {
        time = time.split('.')[0];
        const timeArr = time.split(':');

        let hour: number = +timeArr[0];
        hour = hour + utc;

        if (hour >= 24) {
          hour -= 24;
        }

        let hourString = hour.toString();
        if (hour < 10) {
          hourString = '0' + hourString;
        }

        return hourString + ':' + timeArr[1];
      }
    } else {
      return null;
    }
  }

  static stringToDate(dateString): Date {
    const parts = dateString.split('-');
    const year = +parts[0];
    const month = +parts[1] - 1;
    const day = +parts[2];

    const dateObject = new Date(year, month, day);
    return dateObject;
  }

}
