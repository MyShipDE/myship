import {AfterViewInit, Component, EventEmitter, Output} from '@angular/core';
import $ from 'jquery';

@Component({
  selector: 'app-keyboard',
  templateUrl: './KeyBoard.Component.html',
  styleUrls: ['./KeyBoard.Component.scss'],
})

export class KeyBoardComponent implements AfterViewInit {

  value = '';
  shift = false;

  Visible = false;
  @Output() SendValue: EventEmitter<string> = new EventEmitter<string>();

  ngAfterViewInit(): void {
    $('.action').on('click', (e) => {
      let key: string = $(e.target).html();
      if (this.shift) {
        key = key.toUpperCase();
      } else {
        key = key.toLowerCase();
      }
      this.value += key;
    });
    $('.space').on('click', () => {
      this.value += ' ';
    });
    $('.shift').on('click', () => {
      if (this.shift) {
        $('.action').css('text-transform', 'uppercase');
      } else {
        $('.action').css('text-transform', 'lowercase');
      }
    });
    $('.back').on('click', () => {
      this.value = this.value.slice(0, -1);
    });
  }

  done(): void {
    this.SendValue.emit(this.value);
    this.value = '';
    this.Visible = !this.Visible;
  }

}
