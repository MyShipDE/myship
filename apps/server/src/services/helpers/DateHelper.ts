import {String} from "./String";

export class DateHelper {

    static addHours(numOfHours: number, date = new Date()) {
        date.setTime(date.getTime() + numOfHours * 60 * 60 * 1000);
        return date;
    }

    static addMinutes(minutes: number, date: Date = new Date()) {
        return new Date(date.getTime() + minutes * 60000);
    }

    static removeMinutes(minutes: number, date = new Date()) {
        return new Date(date.getTime() - minutes * 60000);
    }

    static addSeconds(seconds: number, date: Date = new Date()): Date {
        date.setSeconds(date.getSeconds() + seconds);
        return date;
    }

    static format(date: Date): string {
        try {
            const dateArr = date.toLocaleDateString().split('/');
            const timeArr = date.toLocaleTimeString().split(':');

            return `${String.ExtendNullIfNeeded(+dateArr[0])}.${String.ExtendNullIfNeeded(+dateArr[1])}.${String.ExtendNullIfNeeded(+dateArr[2])} - ${String.ExtendNullIfNeeded(+timeArr[0])}.${String.ExtendNullIfNeeded(+timeArr[1])} Uhr`;
        } catch (e) {
            return null;
        }
    }

    static formatForBackup(date: Date): string {
        try {
            const dateArr = date.toLocaleDateString().split('/');
            const timeArr = date.toLocaleTimeString().split(':');

            return `${String.ExtendNullIfNeeded(+dateArr[2])}-${String.ExtendNullIfNeeded(+dateArr[1])}-${String.ExtendNullIfNeeded(+dateArr[0])}_${String.ExtendNullIfNeeded(+timeArr[0])}-${String.ExtendNullIfNeeded(+timeArr[1])}`;
        } catch (e) {
            return null;
        }
    }

}
