import {Injectable} from '@angular/core';
import convertGrade from 'convert-grades';

@Injectable()
export class UnitService {

  // Convert Data from original Format to Default
  convert(value: number, unit: string): IConverterOutput {
    const converted: IConverterOutput = {
      value: 0,
      unit: ''
    };

    switch (unit) {
      case 'ratio':
        converted.value = value * 100;
        converted.unit = '%';
        break;
      case 's':
        converted.value = value;
        converted.unit = unit;
        break;
      case 'A':
        converted.value = value;
        converted.unit = unit;
        break;
      case 'C':
        converted.value = value;
        converted.unit = unit;
        break;
      case 'V':
        converted.value = value;
        converted.unit = unit;
        break;
      case 'K':
        converted.value = convertGrade(value, 'k', 'c');
        converted.unit = '°C';
        break;
      case 'rad':
        converted.value = (value * 180) / Math.PI;
        converted.unit = '°';
        break;
      case 'm':
        converted.value = value;
        converted.unit = unit;
        break;
      case 'm/s':
        converted.value = value * 1.944;
        converted.unit = 'kn';
        break;
    }

    return converted;
  }

  // Convert Data back to original Format
  convertBack(value: number, unit: string): IConverterOutput {
    const converted: IConverterOutput = {
      value: 0,
      unit
    };

    switch (unit) {
      case 'ratio':
        converted.value = value / 100;
        break;
      case 's':
        converted.value = value;
        break;
      case 'A':
        converted.value = value;
        break;
      case 'C':
        converted.value = value;
        break;
      case 'V':
        converted.value = value;
        break;
      case 'K':
        converted.value = convertGrade(value, 'c', 'k');
        break;
      case 'rad':
        converted.value = (value * Math.PI) / 180;
        break;
      case 'm':
        converted.value = value;
        break;
      case 'm/s':
        converted.value = value / 1.944;
        break;
    }

    return converted;
  }

}

export interface IConverterOutput {
  value: number;
  unit: string;
}
