import * as $ from 'jquery';
import {LocalStorageKey} from '../Resource';
import {Control} from "ol/control";

export class CustomControls extends Control {
  constructor() {
    const element = document.createElement('div');
    element.className = 'custom-zoom-control';

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '<img src="assets/icons/white/close.svg">';
    closeButton.classList.add('zoom-btn');
    closeButton.title = 'Close';
    closeButton.addEventListener('click', () => {
      const event = new CustomEvent('close', {detail: {}});
      document.dispatchEvent(event);
    });

    const menuButton = document.createElement('button');
    menuButton.innerHTML = '<img src="assets/icons/white/information.svg">';
    menuButton.classList.add('zoom-btn');
    menuButton.title = 'Menü';
    menuButton.id = 'menu-button';
    menuButton.addEventListener('click', () => {
      $('#menu').slideToggle();
    });

    const zoomInButton = document.createElement('button');
    zoomInButton.innerHTML = '<img src="assets/icons/white/zoom-in.svg">';
    zoomInButton.classList.add('zoom-btn');
    zoomInButton.title = 'Zoom In';
    zoomInButton.addEventListener('click', () => {
      this.getMap().getView().setZoom(this.getMap().getView().getZoom() + 1);
      localStorage.setItem(LocalStorageKey.ZoomScale, this.getMap().getView().getZoom().toString());
    });

    const zoomOutButton = document.createElement('button');
    zoomOutButton.innerHTML = '<img src="assets/icons/white/zoom-out.svg">';
    zoomOutButton.classList.add('zoom-btn');
    zoomOutButton.title = 'Zoom Out';
    zoomOutButton.addEventListener('click', () => {
      this.getMap().getView().setZoom(this.getMap().getView().getZoom() - 1);
      localStorage.setItem(LocalStorageKey.ZoomScale, this.getMap().getView().getZoom().toString());
    });

    element.appendChild(closeButton);
    element.appendChild(menuButton);
    element.appendChild(zoomInButton);
    element.appendChild(zoomOutButton);

    super({
      element
    });
  }
}
