import {AfterViewInit, Component, EventEmitter, Input, IterableDiffers, OnInit, Output} from '@angular/core';
import convertGrade from 'convert-grades';
import {SignalKService} from '../../../../service/SignalK.Service';
import {NightModeService} from '../../../../client-sdk/services/nightMode.service';
import {SignalkData} from '../../../../client-sdk/models/SignalkData';
import {BrainService} from '../../../../service/brain.service';

@Component({
  selector: 'app-statusbar',
  templateUrl: './component.html',
  styleUrls: ['./component.scss']
})

export class StatsBarComponent implements OnInit {

  tankRefreshIntervalReached = true;

  @Input()
  ShowStateModal = false;

  @Output() closeStateModalEvent: EventEmitter<void> = new EventEmitter<void>();

  insideTemperatur: number;
  outsideTemperature: number;

  voltage: number;
  current: number;
  state: number;

  powerVoltage: number;
  powerStatus: boolean;

  tank = '';

  private iterableDiffer: any;

  constructor(private signalK: SignalKService, differs: IterableDiffers,
              public nightModeService: NightModeService,
              private brain: BrainService) {
    this.iterableDiffer = differs.find([]).create(null);
  }

  async ngOnInit(): Promise<void> {
    /* const mqtt = new MQTTService();

    mqtt.client.on('connect', () => {
      console.log('MQTT Connect!');
      mqtt.client.subscribe([
        'tele/RELAY_220V_110/LWT',
        'tele/RELAY_220V_110/SENSOR/#'
      ]);

      mqtt.client.on('message', (topic, msg) => {

        let obj;
        try {
          obj = JSON.parse(msg.toString());
        } catch (e) {
          obj = msg;
        }

        switch (topic) {
          case 'tele/RELAY_220V_110/LWT':
            this.powerStatus = true;
            break;
          case 'tele/RELAY_220V_110/SENSOR':
            this.powerVoltage = obj.ENERGY.Voltage;
            break;
        }

      });
    }); */
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngDoCheck(): void {
    const changes = this.iterableDiffer.diff(this.signalK.dataList);
    if (changes) {
      this.signalK.dataList.forEach((element: SignalkData) => {
        switch (element.getDesc()) {
          case 'environment.outside.temperature':
            this.outsideTemperature = this.round(this.calcCelsius(element.getValue()));
            break;
          case 'environment.inside.temperature':
            this.insideTemperatur = this.round(this.calcCelsius(element.getValue()));
            break;
          case 'electrical.batteries.main.voltage':
            this.voltage = this.round(element.getValue());
            break;
          case 'electrical.batteries.main.current':
            this.current = this.round(element.getValue());
            break;
          case 'electrical.batteries.main.capacity.stateOfCharge':
            this.state = this.round(element.getValue() * 100);
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

  round(x: number): number {
    return Math.round(x * 10) / 10;
  }

  calcCelsius(x: number): number {
    return convertGrade(x, 'k', 'c');
  }

  CloseStateModal(): void {
    this.closeStateModalEvent.emit();
  }

}
