import {AfterViewInit, Component, IterableDiffers, OnInit} from '@angular/core';
import {SignalKService} from '../../../service/SignalK.Service';
import {ComponentTemplate} from '../../../service/ComponentTemplate';
import $ from 'jquery';
import {SecurityQueryService} from '../../../service/securityQuery.service';
import {SecurityQueryResult} from '../../controls/securityQuery/securityQuery.component';
import {ShellyMetadata} from '../../../models/ShellyMetadata';
import {Device} from '../../../client-sdk/models/Device';
import {DeviceService} from '../../../client-sdk/services/device.service';
import {
  ConsumptionStats,
  ElectricityConsumptionService
} from '../../../client-sdk/services/electricityConsumption.service';
import {SignalkData} from '../../../client-sdk/models/SignalkData';
import {LoaderService} from '../../../service/loader.service';
import {star} from "ionicons/icons";
import {MqttService} from "ngx-mqtt";
import {CoreService} from "../../../service/core.service";
import {Subscription} from "rxjs";
import {SocketService} from "../../../service/socket.service";
import {SocketChannel} from "../../../client-sdk/resources/SocketChannel";
import {SignalKDataSet} from "../../../client-sdk/models/SignalKDataSet";
import {DataService} from "../../../client-sdk/services/data.service";

@Component({
  selector: 'app-battery',
  templateUrl: './instruments.component.html',
  styleUrls: ['./instruments.component.scss'],
})
export class BatteryComponent extends ComponentTemplate implements OnInit, AfterViewInit {

  lastDayConsumption = 0;
  lastWeekConsumption = 0;
  lastYearConsumption = 0;

  batteryChargerMetadata: ShellyMetadata;
  plugSocketsMetadata: ShellyMetadata;
  shellyHerdMetadata: ShellyMetadata;

  batteryCharger: Device;
  shellyPlugSockets: Device;
  shellyHerd: Device;

  voltage = 0;
  current = 0;
  state = 0;
  starterVoltage = 0;
  power = 0;

  showBattery = true;
  BatteryBtnBg = 'bg-primary';
  PowerBtnBg = '';

  private iterableDiffer: any;

  constructor(private signalK: SignalKService, differs: IterableDiffers,
              private deviceService: DeviceService,
              private securityQueryService: SecurityQueryService,
              public electricityConsumptionService: ElectricityConsumptionService,
              private loader: LoaderService,
              private websocketService: SocketService,
              private mqttService: MqttService,
              private dataService: DataService) {
    super();
    this.iterableDiffer = differs.find([]).create(null);
  }

  ngAfterViewInit(): void {
    $('#lp_btn').on('click', () => {
      this.showMainsVoltage();
      this.cacheLastTab(1);
    });

    $('#b1_btn').on('click', () => {
      this.showBattery1();
      this.cacheLastTab(2);
    });

    $('#b2_btn').on('click', () => {
      this.showBattery2();
      this.cacheLastTab(3);
    });

    if (window.screen.width <= 1024) {
      this.openLastTab();
    }

  }

  showMainsVoltage(): void {
    $('.landPower').fadeIn();
    $('.b1-c').fadeOut();
    $('.b2-c').fadeOut();
    $('.landPower').css('display', 'flex');
    $('.b1-c').css('display', 'none');
    $('.b2-c').css('display', 'none');
    $('#lp_btn').addClass('selected');
    $('#b1_btn').removeClass('selected');
    $('#b2_btn').removeClass('selected');
  }

  showBattery1(): void {
    $('.landPower').fadeOut();
    $('.b1-c').fadeIn();
    $('.b2-c').fadeOut();
    $('.landPower').css('display', 'none');
    $('.b1-c').css('display', 'flex');
    $('.b2-c').css('display', 'none');
    $('#lp_btn').removeClass('selected');
    $('#b1_btn').addClass('selected');
    $('#b2_btn').removeClass('selected');
  }

  showBattery2(): void {
    $('.landPower').fadeOut();
    $('.b1-c').fadeOut();
    $('.b2-c').fadeIn();
    $('.landPower').css('display', 'none');
    $('.b1-c').css('display', 'none');
    $('.b2-c').css('display', 'flex');
    $('#lp_btn').removeClass('selected');
    $('#b1_btn').removeClass('selected');
    $('#b2_btn').addClass('selected');
  }

  openLastTab(): void {
    const lastTabIndex = localStorage.getItem('MyShip.BatteryTab');

    if (lastTabIndex != null) {
      switch (+lastTabIndex) {
        case 1:
          this.showMainsVoltage();
          break;
        case 2:
          this.showBattery1();
          break;
        case 3:
          this.showBattery2();
          break;
      }
    }
  }

  cacheLastTab(index: number): void {
    const lastTabIndex = localStorage.setItem('MyShip.BatteryTab', index.toString());
  }

  async ngOnInit(): Promise<void> {
    this.loader.startLoading();

    await this.deviceService.load();

    const consumption = await this.electricityConsumptionService.getStats();

    if (consumption != null) {
      this.lastDayConsumption = this.round(consumption.lastDay / 1000);
      this.lastWeekConsumption = this.round(consumption.lastWeek / 1000);
      this.lastYearConsumption = this.round(consumption.lastYear / 1000);
    }

    this.batteryCharger = this.deviceService.list.find(x => x.name === 'Ladegerät');
    this.shellyPlugSockets = this.deviceService.list.find(x => x.name === 'Steckdosen');
    this.shellyHerd = this.deviceService.list.find(x => x.name === 'Herd');

    const batteryChargerTopic = `${this.batteryCharger.bridge.name}/status/switch:0`;
    const plugSocketTopic = `${this.shellyPlugSockets.bridge.name}/status/switch:0`;
    const shellyHerdTopic = `${this.shellyHerd.bridge.name}/status/switch:0`;

    if (this.batteryChargerMetadata == null) {
      this.batteryChargerMetadata = new ShellyMetadata();
    }
    if (this.plugSocketsMetadata == null) {
      this.plugSocketsMetadata = new ShellyMetadata();
    }
    if (this.shellyHerdMetadata == null) {
      this.shellyHerdMetadata = new ShellyMetadata();
    }

    this.mqttService.connect();

    this.mqttService.onConnect.subscribe(() => {
      console.log('Connected to MQTT');
    });

    this.mqttService.observe(batteryChargerTopic).subscribe((message) => {
      const obj = JSON.parse(message.payload.toString());
      this.batteryCharger.isActive = obj.output;
      this.batteryChargerMetadata.state = obj.output;
      this.batteryChargerMetadata.current = obj.current;
      this.batteryChargerMetadata.voltage = obj.voltage;
      this.batteryChargerMetadata.apower = obj.apower;
      this.batteryChargerMetadata.total = obj.aenergy.total;
    });

    this.mqttService.observe(plugSocketTopic).subscribe((message) => {
      const obj = JSON.parse(message.payload.toString());
      this.plugSocketsMetadata.state = obj.output;
      this.plugSocketsMetadata.current = obj.current;
      this.plugSocketsMetadata.voltage = obj.voltage;
      this.plugSocketsMetadata.apower = obj.apower;
      this.plugSocketsMetadata.total = obj.aenergy.total;
    });

    this.mqttService.observe(shellyHerdTopic).subscribe((message) => {
      const obj = JSON.parse(message.payload.toString());
      this.shellyHerdMetadata.state = obj.output;
      this.shellyHerdMetadata.current = obj.current;
      this.shellyHerdMetadata.voltage = obj.voltage;
      this.shellyHerdMetadata.apower = obj.apower;
      this.shellyHerdMetadata.total = obj.aenergy.total;
    });

    const signalKData = await this.dataService.getData("electrical");
    console.log(signalKData);
    if (signalKData != null) {
      this.handleData(signalKData);
    }

    this.listenOnChanges();

    this.loader.stopLoading();
  }

  listenOnChanges() {
    this.websocketService.client.on(SocketChannel.SignalKDataBroadcastObject, (data: SignalKDataSet[]) => {
      this.handleData(data);
    });
  }

  handleData(data: SignalKDataSet[]) {
    for (const element of data) {
      switch (element.path) {
        case 'electrical.batteries.main.voltage':
          this.voltage = this.round(element.value);
          if (this.voltage !== 0 && this.current !== 0) {
            this.power = this.round(this.voltage * this.current);
          }
          break;
        case 'electrical.batteries.main.current':
          this.current = this.round(element.value);
          if (this.voltage !== 0 && this.current !== 0) {
            this.power = this.round(this.voltage * this.current);
          }
          break;
        case 'electrical.batteries.main.capacity.stateOfCharge':
          this.state = this.round(element.value * 100);
          break;
        case 'electrical.batteries.starter.voltage':
          this.starterVoltage = this.round(element.value);
          break;
      }
    }
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngDoCheck(): void {
    const changes = this.iterableDiffer.diff(this.signalK.dataList);
    if (changes) {
      this.signalK.dataList.forEach((element: SignalkData) => {
        switch (element.getDesc()) {
          case 'electrical.batteries.main.voltage':
            this.voltage = this.round(element.getValue());
            if (this.voltage !== 0 && this.current !== 0) {
              this.power = this.round(this.voltage * this.current);
            }
            break;
          case 'electrical.batteries.main.current':
            this.current = this.round(element.getValue());
            if (this.voltage !== 0 && this.current !== 0) {
              this.power = this.round(this.voltage * this.current);
            }
            break;
          case 'electrical.batteries.main.capacity.stateOfCharge':
            this.state = this.round(element.getValue() * 100);
            break;
          case 'electrical.batteries.starter.voltage':
            this.starterVoltage = this.round(element.getValue());
            break;
        }
      });
    }
  }

  async controlBatteryCharger(): Promise<void> {
    const message = `Soll der Verbraucher: ${this.batteryCharger.name} wirklich ${this.batteryCharger.isActive ? 'ausgeschaltet' : 'eingeschaltet'} werden`;
    if (await this.securityQueryService.show(message, true, true, false) === SecurityQueryResult.Yes) {
      await this.deviceService.control(this.batteryCharger);
    }
  }

  round(x: number, full: boolean = false): number {
    if (full) {
      return Math.round(x);
    } else {
      return Math.round(x * 10) / 10;
    }
  }

  get TotalConsumption(): number {
    let sum = 0;

    if (this.batteryChargerMetadata?.total != null) {
      sum += this.batteryChargerMetadata?.total;
    }

    if (this.plugSocketsMetadata?.total != null) {
      sum += this.plugSocketsMetadata.total;
    }

    if (this.shellyHerdMetadata?.total != null) {
      sum += this.shellyHerdMetadata?.total;
    }

    return sum;
  }

  get CurrentConsumption(): number {
    let sum = 0;

    if (this.batteryChargerMetadata?.apower != null) {
      sum += this.batteryChargerMetadata?.apower;
    }

    if (this.plugSocketsMetadata?.apower != null) {
      sum += this.plugSocketsMetadata?.apower;
    }

    if (this.shellyHerdMetadata?.apower != null) {
      sum += this.shellyHerdMetadata?.apower;
    }

    return sum;
  }

  protected readonly star = star;
}
