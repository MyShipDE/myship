import {Injectable} from '@angular/core';
import {SocketService} from './socket.service';
import { HttpClient } from '@angular/common/http';
import {ComponentTemplateService} from './ComponentTemplate.service';
import {HttpService} from '../client-sdk/services/http.service';

@Injectable({
  providedIn: 'root'
})
export class VoiceCenterService extends ComponentTemplateService {

  allMessages: Array<IVoiceEntry>;
  messages: Array<IVoiceEntry>;
  pages: Array<Array<IVoiceEntry>> = [];
  currentPage = 0;

  constructor(private websocket: SocketService,
              private httpService: HttpService,
              private http: HttpClient) {
    super();
  }

  load(): void {
    this.http
      .get<Array<IVoiceEntry>>(this.httpService.api + '/api/vdr/messages', this.httpService.options)
      .subscribe((messages: Array<IVoiceEntry>) => {
        this.pages = [];
        this.allMessages = messages;
        this.allMessages = this.allMessages.sort(x => x.id).reverse();
        let pages = this.allMessages.length / 4;
        pages = Math.round(pages);
        let startIndex = 0;
        let endIndex = 4;
        for (let i = 0; i < pages; i++) {
          this.pages.push(this.allMessages.slice(startIndex, endIndex));
          startIndex += 4;
          endIndex += 4;
        }
        this.setPage();
      });
  }

  setPage(): void {
    if (this.allMessages.length < 4) {
      this.messages = this.allMessages;
    } else {
      this.messages = this.pages[this.currentPage];
    }
  }

  listenWebSocket(): void {
    this.websocket.client.on('vdr.speech.result', () => {
      this.load();
    });
  }
}

class IVoiceEntry {
  id: number;
  message: string;
  createdAt: Date;
  updatedAt: any;
}

