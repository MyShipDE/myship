// @ts-ignore
import convertGrade from 'convert-grades';

export class UnitHelper {

    // Convert Data from original Format to Default
    static convert(value: number, unit: string, round: number = -1): IConverterOutput {
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
            case 'hz':
                converted.value = +(Math.floor((value * 60) / 50) * 50).toFixed(0);
                converted.unit = 'rpm';
                break;
        }

        if (round > 0) {
            const factor = Math.pow(10, round);
            converted.value = Math.round(converted.value * factor) / factor;
        }

        return converted;
    }

    // Convert Data back to original Format
    static convertBack(value: number, unit: string): IConverterOutput {
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
