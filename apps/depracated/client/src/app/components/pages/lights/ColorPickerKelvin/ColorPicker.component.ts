import {AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ComponentTemplate} from '../../../../service/ComponentTemplate';
import 'create-conical-gradient';
import {Scene} from '../../../../client-sdk/models/Scene';
import {LightGroupService} from '../../../../client-sdk/services/lightGroup.service';

@Component({
  selector: 'app-lights-color-picker-kelvin',
  templateUrl: './ColorPicker.component.html',
  styleUrls: ['./ColorPicker.component.scss'],
})

export class ColorPickerKelvinComponent extends ComponentTemplate implements AfterViewInit {

  @ViewChild('rgb')
  rgbCanvas: ElementRef<HTMLCanvasElement>;

  @Input() scene: Scene;
  @Output() sceneChanged: EventEmitter<Scene> = new EventEmitter<Scene>();

  mouseClicked = false;

  private context: CanvasRenderingContext2D;
  private selectedX: number;
  private selectedY: number;
  private image: HTMLImageElement;

  @Output()
  selectedR: number;
  @Output()
  selectedG: number;
  @Output()
  selectedB: number;

  constructor(private lightGroupService: LightGroupService) {
    super();
    this.image = new Image(32, 32);
    this.image.src = 'assets/icons/led-strip.png';
  }

  ngAfterViewInit(): void {
    this.drawBackground();
  }

  drawMarker(): void {
    this.context.lineWidth = 4;
    this.context.strokeStyle = '#202020';
    this.context.arc(this.selectedX, this.selectedY, 12, this.selectedX, this.selectedY);
    // this.context.drawImage(this.image, this.selectedX, this.selectedY, 32, 32);
    this.context.stroke();
  }

  drawBackground(): void {
    const width = this.rgbCanvas.nativeElement.width;
    this.rgbCanvas.nativeElement.height = width;
    const height = this.rgbCanvas.nativeElement.height;

    this.context = this.rgbCanvas.nativeElement.getContext('2d');

    this.context.clearRect(0, 0, width, height);

    const kelvinValues = 58;
    const grad = this.context.createLinearGradient(0, 0, width, height);
    grad.addColorStop(this.calculateOffset(kelvinValues, 0), 'rgb(255, 138, 18)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 1), 'rgb(255, 71, 0)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 2), 'rgb(255, 83, 0)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 3), 'rgb(255, 93, 0)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 4), 'rgb(255, 101, 0)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 5), 'rgb(255, 109, 0)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 6), 'rgb(255, 115, 0)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 7), 'rgb(255, 121, 0)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 8), 'rgb(255, 126, 0)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 9), 'rgb(255, 131, 0)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 10), 'rgb(255, 138, 18)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 11), 'rgb(255, 142, 33)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 12), 'rgb(255, 147, 44)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 13), 'rgb(255, 152, 54)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 14), 'rgb(255, 157, 63)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 15), 'rgb(255, 161, 72)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 16), 'rgb(255, 165, 79)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 17), 'rgb(255, 169, 87)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 18), 'rgb(255, 173, 94)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 19), 'rgb(255, 177, 101)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 20), 'rgb(255, 180, 107)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 21), 'rgb(255, 184, 114)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 22), 'rgb(255, 190, 126)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 23), 'rgb(255, 193, 132)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 24), 'rgb(255, 196, 137)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 25), 'rgb(255, 199, 143)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 26), 'rgb(255, 201, 148)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 27), 'rgb(255, 204, 153)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 28), 'rgb(255, 206, 159)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 29), 'rgb(255, 209, 163)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 30), 'rgb(255, 211, 168)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 31), 'rgb(255, 213, 173)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 32), 'rgb(255, 215, 177)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 33), 'rgb(255, 217, 182)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 34), 'rgb(255, 219, 186)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 35), 'rgb(255, 221, 190)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 36), 'rgb(255, 223, 194)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 37), 'rgb(255, 225, 198)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 38), 'rgb(255, 227, 202)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 39), 'rgb(255, 228, 206)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 40), 'rgb(255, 230, 210)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 41), 'rgb(255, 232, 213)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 42), 'rgb(255, 233, 217)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 43), 'rgb(255, 235, 220)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 44), 'rgb(255, 236, 224)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 45), 'rgb(255, 238, 227)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 46), 'rgb(255, 239, 230)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 47), 'rgb(255, 240, 233)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 48), 'rgb(255, 242, 236)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 49), 'rgb(255, 243, 239)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 50), 'rgb(255, 244, 242)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 51), 'rgb(255, 245, 245)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 52), 'rgb(255, 246, 247)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 53), 'rgb(255, 248, 251)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 54), 'rgb(255, 249, 253)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 55), 'rgb(254, 249, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 56), 'rgb(252, 247, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 57), 'rgb(249, 246, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 58), 'rgb(247, 245, 255)');
    /* grad.addColorStop(this.calculateOffset(kelvinValues, 59), 'rgb(245, 243, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 60), 'rgb(243, 242, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 61), 'rgb(240, 241, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 62), 'rgb(239, 240, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 63), 'rgb(237, 239, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 64), 'rgb(235, 238, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 65), 'rgb(233, 237, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 66), 'rgb(231, 236, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 67), 'rgb(230, 235, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 68), 'rgb(228, 234, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 69), 'rgb(227, 233, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 70), 'rgb(225, 232, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 71), 'rgb(224, 231, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 72), 'rgb(222, 230, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 73), 'rgb(221, 230, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 74), 'rgb(220, 229, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 75), 'rgb(218, 229, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 76), 'rgb(217, 227, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 77), 'rgb(216, 227, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 78), 'rgb(215, 226, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 79), 'rgb(214, 225, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 80), 'rgb(212, 225, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 81), 'rgb(211, 224, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 82), 'rgb(210, 223, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 83), 'rgb(209, 223, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 84), 'rgb(208, 222, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 85), 'rgb(207, 221, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 86), 'rgb(207, 221, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 87), 'rgb(206, 220, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 88), 'rgb(205, 220, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 89), 'rgb(207, 218, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 90), 'rgb(207, 218, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 91), 'rgb(206, 217, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 92), 'rgb(205, 217, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 93), 'rgb(204, 216, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 94), 'rgb(204, 216, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 95), 'rgb(203, 215, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 96), 'rgb(202, 215, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 97), 'rgb(202, 214, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 98), 'rgb(201, 214, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 99), 'rgb(200, 213, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 100), 'rgb(200, 213, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 101), 'rgb(199, 212, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 102), 'rgb(198, 212, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 103), 'rgb(198, 212, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 104), 'rgb(197, 211, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 105), 'rgb(197, 211, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 106), 'rgb(197, 210, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 107), 'rgb(196, 210, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 108), 'rgb(195, 210, 255)');
    grad.addColorStop(this.calculateOffset(kelvinValues, 109), 'rgb(195, 209, 255)'); */

    this.context.fillStyle = grad;
    this.context.fillRect(0, 0, width, height);
  }

  calculateOffset(max: number, index: number): number {
    return (1 / max) * index;
  }

  onMouseDown(evt: MouseEvent): void {
    this.mouseClicked = true;
    this.onMouseMove(evt);
  }

  async onMouseMove(evt: MouseEvent): Promise<void> {
    if (this.mouseClicked) {

      const rect = this.rgbCanvas.nativeElement.getBoundingClientRect();
      const x = evt.clientX - rect.left;
      const y = evt.clientY - rect.top;

      this.selectedX = x;
      this.selectedY = y;

      const image = this.context.getImageData(this.selectedX, this.selectedY, 1, 1).data;
      this.drawBackground();
      this.drawMarker();

      this.selectedR = image[0];
      this.selectedG = image[1];
      this.selectedB = image[2];

      this.scene.R = this.selectedR;
      this.scene.G = this.selectedG;
      this.scene.B = this.selectedB;

      this.sceneChanged.emit(this.scene);

      await this.lightGroupService.controlManual(this.getSelectedGroup(), this.selectedR, this.selectedG, this.selectedB, this.scene.BRI);
    }
  }

}
