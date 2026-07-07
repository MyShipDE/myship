import {Component, IterableDiffers, OnInit} from '@angular/core';
import {SignalKService} from '../../../service/SignalK.Service';
import {ConvertingService} from '../../../service/converting.service';
import {SignalkData} from '../../../client-sdk/models/SignalkData';
import {ComponentTemplate} from '../../../service/ComponentTemplate';
import {EngineMeterService} from '../../../client-sdk/services/engineMeter.service';
import {SocketChannel} from '../../../client-sdk/resources/SocketChannel';
import {SocketService} from '../../../service/socket.service';
import {NightModeService} from '../../../client-sdk/services/nightMode.service';
import {BrainService} from '../../../service/brain.service';

@Component({
  selector: 'app-motor-info',
  templateUrl: './motor-info.component.html',
  styleUrls: ['./motor-info.component.scss']
})

export class MotorInfoComponent extends ComponentTemplate implements OnInit {

  tankRefreshIntervalReached = true;

  motorSpeed = 0;
  motorWater = 0;
  engineMeter = '';
  engineMeterByDay = '';
  tank = '';

  private iterableDiffer: any;

  constructor(private signalK: SignalKService, differs: IterableDiffers,
              private convert: ConvertingService,
              private engineMeterService: EngineMeterService,
              private websocket: SocketService,
              public nightModeService: NightModeService,
              private brain: BrainService) {
    super();
    this.iterableDiffer = differs.find([]).create(null);
  }

  async ngOnInit(): Promise<void> {
    this.engineMeter = this.convert.secToHours(await this.engineMeterService.getSeconds());
    this.engineMeterByDay = this.convert.secondsToDHMS(await this.engineMeterService.getSecondsByDay());
    console.log(await this.engineMeterService.getSecondsByDay());
    this.listenWebSocket();

    setInterval(() => {
      this.tankRefreshIntervalReached = true;
    }, 10000);
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngDoCheck(): void {
    const changes = this.iterableDiffer.diff(this.signalK.dataList);
    if (changes) {
      this.signalK.dataList.forEach((element: SignalkData) => {
        switch (element.getDesc()) {
          case 'electrical.alternators.0.revolutions':
            this.motorSpeed = +this.calcRPM(element.getValue() * 60).toFixed();
            break;
          case 'environment.inside.heating.temperature':
            this.motorWater = this.round(this.convert.calcCelsius(element.getValue()));
            break;
          case 'sensors.analog_input.yellow':
            if (this.tankRefreshIntervalReached) {
              this.tank = this.brain.calcTank(element.getValue());
              this.tankRefreshIntervalReached = false;
            }
            break;
        }
      });
    }
  }

  listenWebSocket(): void {
    this.websocket.client.on(SocketChannel.EngineLogUpdateObject.toString(), (seconds: number) => {
      this.engineMeter = this.convert.secToHours(seconds);
    });
    this.websocket.client.on(SocketChannel.EngineLogUpdateObjectByDay.toString(), (seconds: number) => {
      this.engineMeterByDay = this.convert.secondsToDHMS(seconds);
    });
  }

  calcRPM(data: number): number {
    return Math.floor(data / 50) * 50;
  }

}
