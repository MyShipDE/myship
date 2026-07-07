import {Component, OnInit} from '@angular/core';
import {UnitService} from '../../../service/unit.service';
import {SocketService} from '../../../service/socket.service';
import {Alarm} from '../../../client-sdk/models/Alarm';
import {AlarmService} from '../../../client-sdk/services/alarm.service';
import {Helper} from '../../../service/Helper';
import {SocketChannel} from '../../../client-sdk/resources/SocketChannel';
import {DisplayedAlarm} from '../../../client-sdk/classes/DisplayedAlarm';

@Component({
  selector: 'app-alarm-popup',
  templateUrl: './AlarmPopUp.component.html',
  styleUrls: ['./AlarmPopUp.component.scss']
})

export class AlarmPopUpComponent implements OnInit {

  alarm: DisplayedAlarm;
  value: number;
  soundInterval: NodeJS.Timeout;

  private readonly audio = Helper.getHuston();

  constructor(public unitService: UnitService,
              private websocket: SocketService) {
  }

  listenWebSockets(): void {
    this.websocket.client.on(SocketChannel.AlarmTriggeredObject.toString(), async (alarm: DisplayedAlarm) => {
      this.alarm = alarm;
      await this.audio.play();
      await Helper.sleep(this.audio.duration + 500);
      this.soundInterval = setInterval(async () => {
        await this.audio.play();
        await Helper.sleep(1000);
      }, this.audio.duration);
    });
  }

  async ngOnInit(): Promise<void> {
    this.listenWebSockets();
  }

  get getConvertedValue(): number {
    return this.unitService.convert(this.value, this.alarm.unit).value;
  }

  get getConvertedUnit(): string {
    return this.unitService.convert(this.value, this.alarm.unit).unit;
  }

  close(): void {
    clearInterval(this.soundInterval);
    this.audio.pause();
    this.alarm = null;
  }

}
