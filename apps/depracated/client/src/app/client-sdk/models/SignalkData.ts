import {Helper} from '../../service/Helper';

export class SignalkData {

  private desc: string;
  private value: any;

  constructor(desc: string, value: any) {
    this.desc = desc;
    this.value = value;
  }

  public getDesc(): string {
    return this.desc;
  }

  public setDesc(desc: string): void {
    this.desc = desc;
  }

  public getValue(): any {
    return this.value;
  }

  public setValue(value: any): void {
    this.value = value;
  }

  public formatCords(): any {
    const lat: number = this.getValue().latitude;
    const lon: number = this.getValue().longitude;

    return Helper.convertCoordinates(lat, lon);
  }


}
