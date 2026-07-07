import $ from 'jquery';
import {Helper} from './Helper';
import {DateHelper} from './DateHelper';
import {LightGroup} from '../client-sdk/models/LightGroup';

export class ComponentTemplate {

  static editMode = false;
  static selectedGroup: LightGroup = null;

  constructor() {
    //
  }

  ToggleBoolean(state: boolean): boolean {
    return !state;
  }

  getEditMode(): boolean {
    return ComponentTemplate.editMode;
  }

  getSelectedGroup(): LightGroup {
    return ComponentTemplate.selectedGroup;
  }

  SetBlur(state: boolean): void {
    if (state) {
      $('.blur').css('filter', 'blur(0em)');
    } else {
      $('.blur').css('filter', 'blur(0.3em)');
    }
  }

  CalculatePadding(index: number, padding: number = 3): number {
    const width = $(document).width();
    if (index % 2 === 0) {
      return padding;
    } else {
      if (width <= 600) {
        return padding;
      } else {
        return 0;
      }
    }
    return 0;
  }

  async Vibrate(): Promise<void> {
    try {
      // await Haptics.vibrate();
    } catch (e) {
      console.log('Die Vibration wird nur in der App-Version unterstüzt!');
    }
  }

  roundTwoDecimals(x: number): number {
    if (x == null) {
      return 0.00;
    }
    return Math.round(x * 100) / 100;
  }

  round(x: number): number {
    if (x == null) {
      return 0.0;
    }
    return Math.round(x * 10) / 10;
  }

  ConvertCords(lat, lon): Array<string> {
    return Helper.convertCoordinates(lat, lon);
  }

  convert2Date(x): string {
    if (x == null) {
      return '00.00.0000';
    }
    return DateHelper.convertToDate(x + '');
  }

  convert2Time(x): string {
    if (x == null) {
      return '00:00';
    }
    return DateHelper.convertToTime(x + '', false);
  }

}
