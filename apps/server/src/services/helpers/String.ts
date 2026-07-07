export class String {

    static isNullOrEmpty(characterString: string): boolean {
        return characterString == null || characterString === "";
    }

    static ExtendNullIfNeeded(value: number) {
        if (value < 10) {
            return '0' + value.toString();
        } else {
            return value.toString();
        }
    }

    static generate(length: number) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        return result;
    }

    static generateNumber(length: number) {
        let result = '';
        const characters = '0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        return result;
    }
}
