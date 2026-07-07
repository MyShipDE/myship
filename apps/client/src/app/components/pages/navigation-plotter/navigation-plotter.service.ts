import {Injectable} from '@angular/core';
import {Subject} from "rxjs";

@Injectable()
export class NavigationPlotterService {

  visibilityChanged: Subject<boolean> = new Subject<boolean>();

  private visible = false;

  demoMode = false;

  get isVisible(): boolean {
    return this.visible;
  }

  open(): void {
    this.visible = true;
    this.visibilityChanged.next(this.visible);
  }

  close(): void {
    this.visible = false;
    this.visibilityChanged.next(this.visible);
  }

}
