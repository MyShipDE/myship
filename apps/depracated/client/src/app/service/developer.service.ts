import {Injectable, OnInit} from '@angular/core';

@Injectable()
export class DeveloperService implements OnInit {

  state: boolean;
  private readonly localStorageKey = 'MyShip.Developer.Mode';

  ngOnInit(): void {
    const state = localStorage.getItem(this.localStorageKey);
    if (state == null) {
      this.state = false;
      this.setLocalStorage();
    } else {
      this.state = state === '1';
    }
  }

  getState(): boolean {
    if (this.state == null) {
      this.state = localStorage.getItem(this.localStorageKey) === '1';
    }
    return this.state;
  }

  enable(): void {
    this.state = true;
    this.setLocalStorage();
  }

  disable(): void {
    this.state = false;
    this.setLocalStorage();
  }

  private setLocalStorage(): void {
    localStorage.setItem(this.localStorageKey, this.state ? '1' : '0');
  }

}
