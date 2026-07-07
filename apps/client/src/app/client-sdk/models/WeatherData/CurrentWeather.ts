export interface CurrentWeather {
  currentWeather: {
    asOf: string;
    cloudCover: number;
    conditionCode: string;
    daylight: boolean;
    humidity: number;
    metadata: any;
    name: string;
    precipitationIntensity: number;
    pressure: number;
    pressureTrend: string;
    temperature: number;
    temperatureApparent: number;
    temperatureDewPoint: number;
    uvIndex: number;
    visibility: number;
    windDirection: number;
    windGust: number;
    windSpeed: number;
  };
}
