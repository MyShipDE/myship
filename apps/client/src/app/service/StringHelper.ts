export class StringHelper {
  static random(length): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    return result;
  }

  static getID(): string {
    return this.random(8) + '-' + this.random(16) + '-' + this.random(12);
  }

}
