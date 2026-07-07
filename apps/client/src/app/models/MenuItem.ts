export class MenuItem {
  static menuVersion = '12';

  name: string;
  link: string;
  icon: string;
  favorite: boolean;
  clicks: number;

  constructor(name: string, link: string, icon: string, favorite: boolean) {
    this.name = name;
    this.link = link;
    this.icon = icon;
    this.favorite = favorite;
    if (localStorage.getItem(name + '_clicks') != null) {
      this.clicks = +localStorage.getItem(name + '_clicks');
    } else {
      this.clicks = 0;
    }
  }

  static getTemplate(): Array<MenuItem> {
    return [
      new MenuItem('Beleuchtung', '/beleuchtung', 'led-light.svg', false),
      new MenuItem('Video', '/cam', 'video-camera.svg', false),
      new MenuItem('Logbuch', '/vdr', 'logbook.svg', false),
      new MenuItem('POS - Lichter', '/position-lights', 'light-bulb.svg', false),
      new MenuItem('Schiffsdaten', '/ship', 'information.svg', false),
      new MenuItem('Wetter', '/weather', 'sun.svg', false),
      new MenuItem('Verbraucher', '/verbraucher', 'device.svg', false),
      new MenuItem('Navigation', '/plotter', 'gps.svg', false),
      new MenuItem('Einstellungen', '/settings', 'settings.svg', false)
    ];
  }

  static createCollectionIfNotExists(): void {

    let updateNav = false;
    if (localStorage.getItem('MyShip.MenuItems.Version') == null) {
      updateNav = true;
      localStorage.setItem('MyShip.MenuItems.Version', this.menuVersion);
    } else if (localStorage.getItem('MyShip.MenuItems.Version') !== this.menuVersion) {
      updateNav = true;
      localStorage.setItem('MyShip.MenuItems.Version', this.menuVersion);
    }

    if (localStorage.getItem('MyShip.MenuItems') == null || updateNav) {
      localStorage.setItem('MyShip.MenuItems', JSON.stringify(MenuItem.getTemplate()));
    } else {
      const nav: Array<MenuItem> = JSON.parse(localStorage.getItem('MyShip.MenuItems'));
      if (nav.length !== this.getTemplate().length) {
        localStorage.setItem('MyShip.MenuItems', JSON.stringify(MenuItem.getTemplate()));
      }
    }
  }

  static getFavorites(): Array<MenuItem> {
    MenuItem.createCollectionIfNotExists();
    const nav: Array<MenuItem> = JSON.parse(localStorage.getItem('MyShip.MenuItems'));
    return nav.filter(x => x.favorite);
  }

  static getMainMenuElements(): Array<MenuItem> {
    MenuItem.createCollectionIfNotExists();
    const nav: Array<MenuItem> = JSON.parse(localStorage.getItem('MyShip.MenuItems'));
    return nav.filter(x => !x.favorite);
  }

  static getAll(): Array<MenuItem> {
    MenuItem.createCollectionIfNotExists();
    return JSON.parse(localStorage.getItem('MyShip.MenuItems'));
  }

}
