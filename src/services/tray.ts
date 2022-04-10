import { App, BrowserWindow, Menu, nativeImage, Tray} from "electron";
import Store from "electron-store";

import path from "path";

const appTitle = "MSFS2020 Map Enhancement"

export default class {
  win: BrowserWindow;
  app: App;
  store: Store;
  tray: Tray | null;
  trayIcon: nativeImage;
  trayMenu: Menu;
  isQuitting = false;

  constructor(win: BrowserWindow, app: App, store: Store ) {
    this.win = win;
    this.app = app;
    this.store = store;
    this.tray = null;

    this.trayIcon = nativeImage.createFromPath(path.join(__dirname, "../public/icon.png"));

    this.trayMenu = this.createTrayMenu();

    this.app.on("before-quit", () => {
      if (this.tray) {
        this.tray.destroy();
        this.tray = null;
      }
    });

    this.maybeHookTray();
  }

  createTrayMenu(): Menu {
    return Menu.buildFromTemplate([
      { label: 'Show', click: () => {
        this.win.show();
      }},
      { label: 'Quit', click: () => {
        this.isQuitting = true;
        this.app.quit();
      }}
    ]);
  }

  reloadConfig(): void {
    this.maybeHookTray();
    this.maybeShow();
  }

  maybeShow(): void {
    if(this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
    if (this.store.get("useTrayIcon", false)) {
      this.tray = new Tray(this.trayIcon);
      this.tray.setTitle(appTitle);
      this.tray.setToolTip(appTitle);
      this.tray.setContextMenu(this.trayMenu);
    }
  }
  
  handleWindowClose = ((e: Event): void => {
    if (!this.isQuitting) {
      e.preventDefault();
      this.win.hide();
    }
  }).bind(this);

  handleWindowMinimize = ((e: Event): void => {
    e.preventDefault();
    this.win.hide();
  }).bind(this);

  maybeHookTray(): void {
    this.win.removeListener("close", this.handleWindowClose);
    this.win.removeListener("minimize", this.handleWindowMinimize);

    if (this.store.get("useTrayIcon", false)) {
      if (this.store.get("keepRunningWhenClosed", false)) {
        this.win.on('close', this.handleWindowClose);
      }
      if (this.store.get("minimizeToTray", false)) {
        this.win.on('minimize', this.handleWindowMinimize);
      }
    }
  }
}