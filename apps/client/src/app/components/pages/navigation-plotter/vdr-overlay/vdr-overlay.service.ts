import {Subject} from 'rxjs';
import {Injectable} from '@angular/core';

@Injectable()
export class VdrOverlayService {
  visibilityChanged: Subject<boolean> = new Subject<boolean>();

  viewArchive = false;
  viewDatepicker = false;

  private visible = false;

  get isVisible(): boolean {
    return this.visible;
  }

  open(): void {
    this.visible = true;
    this.visibilityChanged.next(this.visible);
  }

  close(): void {
    this.visible = false;
    this.viewArchive = false;
    this.viewDatepicker = false;
    this.visibilityChanged.next(this.visible);
  }
}
