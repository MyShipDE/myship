import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DatepickerDay} from '../../../client-sdk/models/DatepickerDay';

@Component({
  selector: 'app-datepicker-element-component',
  templateUrl: './DatepickerElementComponent.html',
  styleUrls: [
    './DatepickerElementComponent.scss'
  ],
})
export class DatepickerElementComponent {

  @Input() detailsProp: Date[] = [];

  @Input() set details(value: Date[]) {
    this.detailsProp = value;
    this.refresh();
  }

  @Output() dateSelected = new EventEmitter<string>();

  year: number;
  month: number;
  day: number;
  numOfDays: number;

  tYear: number;
  tMonth: number;
  tDay: number;

  months = [
    'Januar',
    'Feburar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember'
  ];

  dayNames = [
    'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'
  ];

  days = [];

  constructor() {
    const date = new Date();
    this.year = date.getFullYear();
    this.month = date.getMonth();
    this.day = date.getDate();

    this.tYear = date.getFullYear();
    this.tMonth = date.getMonth();
    this.tDay = date.getDate();
  }

  refresh(): void {
    this.numOfDays = this.getDaysInMonth(this.year, this.month);
    this.days = [];
    let tempArr: DatepickerDay[] = [];
    let dayCount = 1;
    let hiddenDays = 0;
    for (let i = 1; i <= this.numOfDays + hiddenDays; i++) {
      const firstDay = new Date(this.year, this.month, 1).getDay();
      let today = false;
      let enabled = false;

      if (tempArr.length === 7) {
        this.days.push(tempArr);
        tempArr = [];
      }

      if (this.tDay === dayCount && this.tMonth === this.month && this.tYear === this.year) {
        today = true;
      }

      let dayWithNull;
      if (dayCount < 10) {
        dayWithNull = '0' + dayCount;
      } else {
        dayWithNull = dayCount;
      }

      let month;
      if (this.month < 10) {
        month = '0' + (this.month + 1);
      } else {
        month = this.month + 1;
      }

      const date = this.year + '-' + month + '-' + dayWithNull;

      if (this.detailsProp.find(x => x.toString().split('T')[0] === date)) {
        enabled = true;
      }

      const dayItem = new DatepickerDay();
      dayItem.enabled = enabled;
      dayItem.today = today;
      dayItem.date = date;

      if (firstDay === 0 && this.days.length === 0) {
        this.days.push([
          ['00', enabled, today, date],
          ['00', enabled, today, date],
          ['00', enabled, today, date],
          ['00', enabled, today, date],
          ['00', enabled, today, date],
          ['00', enabled, today, date],
          ['01', enabled, today, date]
        ]);
        dayCount++;
      } else if (i >= firstDay) {
        if (dayCount < 10) {
          dayItem.value = '0' + dayCount;
        } else {
          dayItem.value = '' + dayCount;
        }
        dayCount++;
      } else {
        dayItem.value = '00';
        hiddenDays++;
      }

      tempArr.push(dayItem);
    }

    if (tempArr.length > 0) {
      this.days.push(tempArr);
    }
  }

  getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  nextMonth(): void {
    if (this.month >= 11) {
      this.year++;
      this.month = 0;
    } else {
      this.month++;
    }
    this.refresh();
  }

  prevMonth(): void {
    if (this.month === 0) {
      this.month = 11;
      this.year--;
    } else {
      this.month--;
    }
    this.refresh();
  }

  nextYear(): void {
    this.year++;
    this.refresh();
  }

  prevYear(): void {
    if (this.year > 2) {
      this.year--;
      this.refresh();
    }
  }

  selectDate(date: string): void {
    this.dateSelected.emit(date);
  }

}
