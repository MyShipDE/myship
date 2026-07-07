import {Component, IterableDiffers, OnInit} from '@angular/core';
import {SignalKService} from '../../../service/SignalK.Service';
import convertGrade from 'convert-grades';
import * as L from './leaflet';
import {HttpClient} from '@angular/common/http';
import {AlertsService, AlertState} from '../../../service/alerts.service';
import {CurrentWeather} from '../../../client-sdk/models/WeatherData/CurrentWeather';
import {ForecastData} from '../../../client-sdk/models/WeatherData/ForecastData';
import {HttpService} from '../../../client-sdk/services/http.service';
import {ConvertingService} from '../../../service/converting.service';
import {SignalkData} from '../../../client-sdk/models/SignalkData';
import {LoaderService} from '../../../service/loader.service';
import {DeviceService} from '../../../client-sdk/services/device.service';
import {send} from 'ionicons/icons';

require('./leaflet');
require('./windy');

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss'],
})
export class WeatherComponent implements OnInit {

  windSensorActive: boolean = null;

  lat: string;
  lon: string;
  latDecimal: string;
  lonDecimal: string;

  currentForecast: CurrentWeather;
  dailyForecast: any;
  days: Array<ForecastData> = new Array<ForecastData>();
  dayNames = [];

  // Weather Details
  currentTemp = 0;
  currentWind = 0;
  currentWindBft = 0;
  currentPressure = 0;
  currentPressureTrend = '';
  currentWindDegree = 0;

  map: any;
  shipIcon = L.icon({
    iconUrl: 'assets/img/icon.png',
    iconSize: [50, 50],
    iconAnchor: [20, 40],
    popupAnchor: [0, 0],
  });

  Layers = {
    clean: '',
    clouds: 'clouds_new',
    precipitation: 'precipitation_new',
    pressure: 'pressure_new',
    wind: 'wind_new',
    temp: 'temp_new'
  };
  selectedLayer: string;

  retryCount = 3;

  mobileSwitch = false;

  private iterableDiffer: any;
  private inital = false;

  constructor(private signalK: SignalKService, differs: IterableDiffers,
              private http: HttpClient, private httpService: HttpService,
              private deviceService: DeviceService,
              public convert: ConvertingService,
              private alertService: AlertsService,
              private loader: LoaderService) {
    this.iterableDiffer = differs.find([]).create(null);
    this.selectedLayer = this.Layers.clean;
  }

  async ngOnInit(): Promise<void> {
    await this.deviceService.load();
    this.windSensorActive = this.deviceService.list.find(x => x.name === 'Wind')?.isActive;
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngDoCheck(): void {
    const changes = this.iterableDiffer.diff(this.signalK.dataList);
    if (changes) {
      this.signalK.dataList.forEach((element: SignalkData) => {
        switch (element.getDesc()) {
          case 'environment.outside.temperature':
            this.currentTemp = this.round(+this.calcCelsius(element.getValue()));
            break;
          case 'environment.wind.angleApparent':
            this.currentWindDegree = this.round((element.getValue() * 180) / Math.PI);
            if (this.currentWindDegree < 0) {
              this.currentWindDegree *= (-1);
            }
            break;
          case 'environment.wind.speedApparent':
            this.currentWindBft = this.round(this.convert.mpsToBeaufort(element.getValue()));
            break;
          case 'navigation.position':
            this.lon = element.formatCords()[0];
            this.lat = element.formatCords()[1];
            this.lonDecimal = element.getValue().longitude;
            this.latDecimal = element.getValue().latitude;
            if (!this.inital) {
              this.prepare();
              this.loadData(element.getValue().latitude, element.getValue().longitude);
              this.loadWindy(element.getValue().latitude, element.getValue().longitude);
              this.inital = true;
            }
            break;
        }
      });
    }
  }

  prepare(): void {
    this.dayNames = [
      'Sonntag',
      'Montag',
      'Dienstag',
      'Mittwoch',
      'Donnerstag',
      'Freitag',
      'Samstag',
    ];
  }

  loadData(lat, lon): void {
    let retries = 0;
    this.http
      .get(`${this.httpService.api}/api/weather/current/${lat}/${lon}`, this.httpService.options)
      .subscribe((current: CurrentWeather) => {
        this.loader.stopLoading();
        this.currentForecast = current;
        this.currentWindDegree = this.currentForecast.currentWeather.windDirection;

        this.currentPressure = this.currentForecast.currentWeather.pressure;
        this.currentPressureTrend = this.currentForecast.currentWeather.pressureTrend;

        this.http
          .get(`${this.httpService.api}/api/weather/forecast/${lat}/${lon}`, this.httpService.options)
          .subscribe((forecast: any) => {
            this.loader.stopLoading();
            this.dailyForecast = forecast;

            this.days.push(this.dailyForecast.forecastDaily.days[2]);
            this.days.push(this.dailyForecast.forecastDaily.days[3]);
            this.days.push(this.dailyForecast.forecastDaily.days[4]);

            this.loader.stopLoading();

          }, () => {
            if (retries < this.retryCount) {
              retries++;
              setTimeout(() => {
                this.loadData(lat, lon);
              }, 2000);
              return;
            } else {
              this.alertService.alert(AlertState.Error, 'Die Wettervorhersage konnte nicht abgerufen werden.');
              this.loader.stopLoading();
              return;
            }
          });

      }, () => {
        if (retries < this.retryCount) {
          retries++;
          setTimeout(() => {
            this.loadData(lat, lon);
          }, 2000);
          return;
        } else {
          this.alertService.alert(AlertState.Error, 'Die Wettervorhersage konnte nicht abgerufen werden.');
          this.loader.stopLoading();
          return;
        }
      });
  }

  loadMap(lat, lon, layer: string = null): void {
    this.map = L.map('windy', {
      center: [lat, lon],
      zoom: 12
    });

    L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(this.map);

    if (layer != null) {
      L.tileLayer(`https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=865a433cb7ac16a7fddb4ef46aaf56a4`).addTo(this.map);
    }

    L.marker([lat, lon], {
      icon: this.shipIcon
    }).addTo(this.map);
  }

  changeMap(): void {
    this.loadMap(this.latDecimal, this.lonDecimal, this.selectedLayer);
  }

  loadWindy(latSource, lonSource): void {
    const options = {
      key: 'slhsro07xs5EVQl4emcsiONI3TgpzSiB',
      verbose: false,
      lat: latSource,
      lon: lonSource,
      zoom: 2,
    };

    // @ts-ignore
    windyInit(options, (windyAPI) => {
      const {picker, utils, broadcast, map} = windyAPI;

      const shipIcon = L.icon({
        iconUrl: 'assets/img/icon.png',
        iconSize: [50, 50],
        iconAnchor: [20, 40],
        popupAnchor: [0, 0],
      });

      picker.on('pickerOpened', (latLon) => {
        const {lat, lon, values, overlay} = picker.getParams();
        const windObject = utils.wind2obj(values);
      });

      broadcast.once('redrawFinished', () => {
        picker.open({lat: latSource, lon: lonSource});
      });

      L.marker([latSource, lonSource], {
        icon: shipIcon,
      }).addTo(map);

      map.flyTo([latSource, lonSource], 10);
    });
  }

  public getBft(ms): number {
    if (ms >= 0 && ms <= 0.2) {
      return 0;
    } else if (ms >= 0.3 && ms <= 1.5) {
      return 1;
    } else if (ms >= 1.6 && ms <= 3.3) {
      return 2;
    } else if (ms >= 3.4 && ms <= 5.4) {
      return 3;
    } else if (ms >= 5.5 && ms <= 7.9) {
      return 4;
    } else if (ms >= 8.0 && ms <= 10.7) {
      return 5;
    } else if (ms >= 10.8 && ms <= 13.8) {
      return 6;
    } else if (ms >= 13.9 && ms <= 17.1) {
      return 7;
    } else if (ms >= 17.2 && ms <= 20.7) {
      return 8;
    } else if (ms >= 20.8 && ms <= 24.4) {
      return 9;
    } else if (ms >= 24.5 && ms <= 28.4) {
      return 10;
    } else if (ms >= 28.5 && ms <= 32.6) {
      return 11;
    } else if (ms >= 32.9) {
      return 12;
    }
    return 0;
  }

  kmhToBeaufort(speed: number): number {
    if (speed < 1) {
      return 0;
    }
    if (speed <= 5) {
      return 1;
    }
    if (speed <= 11) {
      return 2;
    }
    if (speed <= 19) {
      return 3;
    }
    if (speed <= 28) {
      return 4;
    }
    if (speed <= 38) {
      return 5;
    }
    if (speed <= 49) {
      return 6;
    }
    if (speed <= 61) {
      return 7;
    }
    if (speed <= 74) {
      return 8;
    }
    if (speed <= 88) {
      return 9;
    }
    if (speed <= 102) {
      return 10;
    }
    if (speed <= 117) {
      return 11;
    }
    if (speed > 117) {
      return 12;
    }
    return 0;
  }

  public round(value): number {
    return Math.round((value + Number.EPSILON) * 10) / 10;
  }

  public roundInt(value): number {
    return Math.round((value + Number.EPSILON) * 1) / 1;
  }

  calcCelsius(x: number): number {
    return convertGrade(x, 'k', 'c');
  }

  getDate(date: string): number {
    return new Date(date).getUTCDay();
  }

  convertPressure(value: string): number {
    if (value === 'rising') {
      return 1;
    } else if (value === 'falling') {
      return -1;
    } else if (value === 'steady') {
      return 0;
    }
  }

  protected readonly send = send;
}
