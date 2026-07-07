import {Component, Input, ViewChild, ElementRef, SimpleChanges} from '@angular/core';
import {ComponentTemplate} from '../../../service/ComponentTemplate';

const angle = ([a, b], [c, d], [e, f]) => (Math.atan2(f - d, e - c) - Math.atan2(b - d, a - c) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;

@Component({
  selector: 'app-svg-wind',
  templateUrl: './svg-wind.component.html',
  styleUrls: ['./svg-wind.component.scss']
})
export class SvgWindComponent extends ComponentTemplate {

  @ViewChild('compassAnimate') compassAnimate: ElementRef;
  @ViewChild('appWindAnimate') appWindAnimate: ElementRef;
  @ViewChild('trueWindAnimate') trueWindAnimate: ElementRef;

  // tslint:disable-next-line:no-input-rename
  @Input('compassHeading') compassHeading: number;
  // tslint:disable-next-line:no-input-rename
  @Input('trueWindAngle') trueWindAngle: number;
  // tslint:disable-next-line:no-input-rename
  @Input('trueWindSpeed') trueWindSpeed: number;
  // tslint:disable-next-line:no-input-rename
  @Input('appWindAngle') appWindAngle: number;
  // tslint:disable-next-line:no-input-rename
  @Input('appWindSpeed') appWindSpeed: number;
  // tslint:disable-next-line:no-input-rename
  @Input('laylineAngle') laylineAngle: number;
  // tslint:disable-next-line:no-input-rename
  @Input('laylineEnable') laylineEnable: boolean;
  // tslint:disable-next-line:no-input-rename
  @Input('windSectorEnable') windSectorEnable: boolean;
  // tslint:disable-next-line:no-input-rename
  @Input('trueWindMinHistoric') trueWindMinHistoric: number;
  // tslint:disable-next-line:no-input-rename
  @Input('trueWindMidHistoric') trueWindMidHistoric: number;
  // tslint:disable-next-line:no-input-rename
  @Input('trueWindMaxHistoric') trueWindMaxHistoric: number;


  constructor() {
    super();
  }

  oldCompassRotate = 0;
  newCompassRotate = 0;
  headingValue = '0';

  oldAppWindAngle = '0';
  newAppWindAngle = '0';
  appWindSpeedDisplay = '';

  oldTrueWindRotateAngle = '0';
  newTrueWindRotateAngle = '0';
  trueWindHeading = 0;
  trueWindSpeedDisplay = '';

  laylinePortPath = 'M 250,250 250,90';
  laylineStbdPath = 'M 250,250 250,90';

  portWindSectorPath = 'none';
  stbdWindSectorPath = 'none';

  tryAnimate() {
    try {
      this.compassAnimate.nativeElement.beginElement();
    } catch (e) {
      setTimeout(() => {
        this.tryAnimate();
      }, 1000);
    }
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnChanges(changes: SimpleChanges): void {

    if (changes.compassHeading) {
      this.oldCompassRotate = this.newCompassRotate;
      this.newCompassRotate = changes.compassHeading.currentValue;
      this.headingValue = this.newCompassRotate.toFixed(0);
      this.tryAnimate();
      this.updateTrueWind();
      this.updateWindSectors();
    }

    if (changes.appWindAngle) {
      if (!changes.appWindAngle.firstChange) {
        this.oldAppWindAngle = this.newAppWindAngle;
        this.newAppWindAngle = changes.appWindAngle.currentValue.toFixed(0);

        const oldAngle = Number(this.oldAppWindAngle);
        const newAngle = Number(this.newAppWindAngle);
        const diff = oldAngle - newAngle;

        if (this.appWindAnimate && (diff !== 0)) {
          if (Math.abs(diff) > 180) {
            if (Math.sign(diff) === 1) {
              if (oldAngle === 359) {
                this.oldAppWindAngle = '0';
                this.appWindAnimate.nativeElement.beginElement();
              } else {
                this.newAppWindAngle = '359';
                this.appWindAnimate.nativeElement.beginElement();
                this.oldAppWindAngle = '0';
                this.newAppWindAngle = changes.appWindAngle.currentValue.toFixed(0);
                this.appWindAnimate.nativeElement.beginElement();
              }
            } else {
              if (oldAngle === 0) {
                this.oldAppWindAngle = '359';
                this.appWindAnimate.nativeElement.beginElement();
              } else {
                this.newAppWindAngle = '0';
                this.appWindAnimate.nativeElement.beginElement();
                this.oldAppWindAngle = '359';
                this.newAppWindAngle = changes.appWindAngle.currentValue.toFixed(0);
                this.appWindAnimate.nativeElement.beginElement();
              }
            }
          } else {
            this.appWindAnimate.nativeElement.beginElement();
          }
        }
      }
    }

    if (changes.appWindSpeed) {
      if (!changes.appWindSpeed.firstChange) {
        this.appWindSpeedDisplay = changes.appWindSpeed.currentValue.toFixed(1);
      }
    }

    if (changes.trueWindAngle) {
      if (!changes.trueWindAngle.firstChange) {
        this.trueWindHeading = changes.trueWindAngle.currentValue;
        this.updateTrueWind();
      }
    }

    // trueWindSpeed
    if (changes.trueWindSpeed) {
      if (!changes.trueWindSpeed.firstChange) {
        this.trueWindSpeedDisplay = changes.trueWindSpeed.currentValue.toFixed(1);
      }
    }

    // Min/Max
    if (changes.trueWindMinHistoric || changes.trueWindMaxHistoric) {
      if (isNaN(Number((this.trueWindMinHistoric))) && isNaN(Number(this.trueWindMaxHistoric))) {
        this.updateWindSectors();
      }
    }

  }

  updateTrueWind(): void {
    this.oldTrueWindRotateAngle = this.newTrueWindRotateAngle;
    this.newTrueWindRotateAngle = this.addHeading(this.trueWindHeading, (this.newCompassRotate * -1)).toFixed(0);

    const oldAngle = Number(this.oldTrueWindRotateAngle);
    const newAngle = Number(this.newTrueWindRotateAngle);
    const diff = oldAngle - newAngle;

    if (this.trueWindAnimate && (diff !== 0)) {
      if (Math.abs(diff) > 180) {
        if (Math.sign(diff) === 1) {
          if (oldAngle === 359) {
            this.oldTrueWindRotateAngle = '0';
            this.trueWindAnimate.nativeElement.beginElement();
          } else {
            this.newTrueWindRotateAngle = '359';
            this.trueWindAnimate.nativeElement.beginElement();
            this.oldTrueWindRotateAngle = '0';
            this.newTrueWindRotateAngle = this.addHeading(this.trueWindHeading, (this.newCompassRotate * -1)).toFixed(0);
            this.trueWindAnimate.nativeElement.beginElement();
          }
        } else {
          if (oldAngle === 0) {
            this.oldTrueWindRotateAngle = '359';
            this.trueWindAnimate.nativeElement.beginElement();
          } else {
            this.newTrueWindRotateAngle = '0';
            this.trueWindAnimate.nativeElement.beginElement();
            this.oldTrueWindRotateAngle = '359';
            this.newTrueWindRotateAngle = this.addHeading(this.trueWindHeading, (this.newCompassRotate * -1)).toFixed(0);
            this.trueWindAnimate.nativeElement.beginElement();
          }
        }
      } else {
        this.trueWindAnimate.nativeElement.beginElement();
      }
    }

    const portLaylineRotate = this.addHeading(Number(this.newTrueWindRotateAngle), (this.laylineAngle * -1));
    const portX = 160 * Math.sin((portLaylineRotate * Math.PI) / 180) + 250;
    const portY = (160 * Math.cos((portLaylineRotate * Math.PI) / 180) * -1) + 250;
    this.laylinePortPath = 'M 250,250 ' + portX + ',' + portY;

    const stbdLaylineRotate = this.addHeading(Number(this.newTrueWindRotateAngle), (this.laylineAngle));
    const stbdX = 160 * Math.sin((stbdLaylineRotate * Math.PI) / 180) + 250;
    const stbdY = (160 * Math.cos((stbdLaylineRotate * Math.PI) / 180) * -1) + 250;
    this.laylineStbdPath = 'M 250,250 ' + stbdX + ',' + stbdY;

  }

  updateWindSectors(): void {
    const portMin = this.addHeading(this.addHeading(this.trueWindMinHistoric, (this.newCompassRotate * -1)), (this.laylineAngle * -1));
    const portMid = this.addHeading(this.addHeading(this.trueWindMidHistoric, (this.newCompassRotate * -1)), (this.laylineAngle * -1));
    const portMax = this.addHeading(this.addHeading(this.trueWindMaxHistoric, (this.newCompassRotate * -1)), (this.laylineAngle * -1));

    const portMinX = 160 * Math.sin((portMin * Math.PI) / 180) + 250;
    const portMinY = (160 * Math.cos((portMin * Math.PI) / 180) * -1) + 250;
    const portMidX = 160 * Math.sin((portMid * Math.PI) / 180) + 250;
    const portMidY = (160 * Math.cos((portMid * Math.PI) / 180) * -1) + 250;
    const portMaxX = 160 * Math.sin((portMax * Math.PI) / 180) + 250;
    const portMaxY = (160 * Math.cos((portMax * Math.PI) / 180) * -1) + 250;

    const portLgArcFl = Math.abs(angle([portMinX, portMinY], [portMidX, portMidY], [portMaxX, portMaxY])) > Math.PI / 2 ? 0 : 1;
    const portSweepFl = angle([portMaxX, portMaxY], [portMinX, portMinY], [portMidX, portMidY]) > 0 ? 0 : 1;

    // tslint:disable-next-line:max-line-length
    this.portWindSectorPath = 'M 250,250 L ' + portMinX + ',' + portMinY + ' A 160,160 0 ' + portLgArcFl + ' ' + portSweepFl + ' ' + portMaxX + ',' + portMaxY + ' z';
    const stbdMin = this.addHeading(this.addHeading(this.trueWindMinHistoric, (this.newCompassRotate * -1)), (this.laylineAngle));
    const stbdMid = this.addHeading(this.addHeading(this.trueWindMidHistoric, (this.newCompassRotate * -1)), (this.laylineAngle));
    const stbdMax = this.addHeading(this.addHeading(this.trueWindMaxHistoric, (this.newCompassRotate * -1)), (this.laylineAngle));

    const stbdMinX = 160 * Math.sin((stbdMin * Math.PI) / 180) + 250;
    const stbdMinY = (160 * Math.cos((stbdMin * Math.PI) / 180) * -1) + 250;
    const stbdMidX = 160 * Math.sin((stbdMid * Math.PI) / 180) + 250;
    const stbdMidY = (160 * Math.cos((stbdMid * Math.PI) / 180) * -1) + 250;
    const stbdMaxX = 160 * Math.sin((stbdMax * Math.PI) / 180) + 250;
    const stbdMaxY = (160 * Math.cos((stbdMax * Math.PI) / 180) * -1) + 250;

    const stbdLgArcFl = Math.abs(angle([stbdMinX, stbdMinY], [stbdMidX, stbdMidY], [stbdMaxX, stbdMaxY])) > Math.PI / 2 ? 0 : 1;
    const stbdSweepFl = angle([stbdMaxX, stbdMaxY], [stbdMinX, stbdMinY], [stbdMidX, stbdMidY]) > 0 ? 0 : 1;

    // tslint:disable-next-line:max-line-length
    this.stbdWindSectorPath = 'M 250,250 L ' + stbdMinX + ',' + stbdMinY + ' A 160,160 0 ' + stbdLgArcFl + ' ' + stbdSweepFl + ' ' + stbdMaxX + ',' + stbdMaxY + ' z';
  }

  addHeading(h1: number = 0, h2: number = 0): number {
    let h3 = h1 + h2;
    while (h3 > 359) {
      h3 = h3 - 359;
    }
    while (h3 < 0) {
      h3 = h3 + 359;
    }
    return h3;
  }
}
