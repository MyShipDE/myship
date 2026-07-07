export class NumberHelper {

    static isValid(value: any): boolean {
        return typeof value === 'number' && !isNaN(value);
    }

}