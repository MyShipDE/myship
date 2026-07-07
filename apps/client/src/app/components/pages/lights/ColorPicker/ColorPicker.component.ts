import {AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ComponentTemplate} from '../../../../service/ComponentTemplate';
import 'create-conical-gradient';
import {Scene} from '../../../../client-sdk/models/Scene';
import {LightGroupService} from '../../../../client-sdk/services/lightGroup.service';
import {NightModeService} from "../../../../client-sdk/services/nightMode.service";

@Component({
  selector: 'app-lights-color-picker',
  templateUrl: './ColorPicker.component.html',
  styleUrls: ['./ColorPicker.component.scss'],
})

export class ColorPickerComponent extends ComponentTemplate implements AfterViewInit {

  @ViewChild('rgb')
  rgbCanvas: ElementRef<HTMLCanvasElement>;

  @Input() scene: Scene;
  @Output() sceneChanged: EventEmitter<Scene> = new EventEmitter<Scene>();

  mouseClicked = false;

  private context: CanvasRenderingContext2D;
  private selectedX: number;
  private selectedY: number;
  private image: HTMLImageElement;

  selectedR: number;
  selectedG: number;
  selectedB: number;

  constructor(private lightGroupService: LightGroupService,
              public nightModeService: NightModeService) {
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

    const grad = this.context.createConicalGradient(width / 2, height / 2, -Math.PI, Math.PI);
    grad.addColorStop(0, 'red');
    grad.addColorStop(0.16, 'yellow');
    grad.addColorStop(0.33, 'lime');
    grad.addColorStop(0.5, 'aqua');
    grad.addColorStop(0.67, 'blue');
    grad.addColorStop(0.83, 'magenta');
    grad.addColorStop(1, 'red');

    this.context.fillStyle = grad.pattern;
    this.context.fillRect(0, 0, width, height);

    const point = this.context.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, 64);
    point.addColorStop(0, 'rgb(255,255,255)');
    point.addColorStop(0.2, 'rgba(255,255,255,.8)');
    point.addColorStop(0.4, 'rgba(255,255,255,.6)');
    point.addColorStop(0.6, 'rgba(255,255,255,.4)');
    point.addColorStop(0.8, 'rgba(255,255,255,.2)');
    point.addColorStop(1, 'rgba(255,255,255,.1)');

    this.context.fillStyle = point;
    this.context.fillRect(0, 0, width, height);
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
