import {Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {ComponentTemplate} from '../../../service/ComponentTemplate';
import {SocketService} from '../../../service/socket.service';

@Component({
  selector: 'app-record-audio-screen',
  templateUrl: './AudioRecordScreen.Component.html',
  styleUrls: ['./AudioRecordScreen.Component.scss']
})

export class AudioRecordScreenComponent extends ComponentTemplate implements OnInit {

  Visibility = false;
  Interval: NodeJS.Timeout;

  constructor(private ws: SocketService) {
    super();
  }

  listenWebSocket(): void {
    if (this.ws.client != null) {
      clearInterval(this.Interval);
      this.ws.client.on('wireless.button', async state => {
        this.Visibility = state === 1;
      });
    }

  }

  ngOnInit(): void {
    this.Interval = setInterval(() => {
      this.listenWebSocket();
    }, 2000);
  }

}
