export class RGBHelper {

    static convertRGBToHex(r: number, g: number, b: number): string {
        const hexR = r.toString(16).padStart(2, '0');
        const hexG = g.toString(16).padStart(2, '0');
        const hexB = b.toString(16).padStart(2, '0');

        return `${hexR}${hexG}${hexB}`;
    }

    static hexToRgb(hex: string): any {
        // Entferne das #-Zeichen, falls es vorhanden ist
        hex = hex.replace('#', '');

        // Extrahiere die RGB-Komponenten
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        // Gib die RGB-Komponenten als formatierte Zeichenkette zurück
        return {
            r, g, b
        };
    }

    static valueToPercentage(value: number): number {
        const percentage = Math.round((value / 255) * 100);
        return percentage;
    }

}
