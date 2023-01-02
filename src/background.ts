"use strict";
import { autoUpdater } from "electron-updater"
import { app, protocol, BrowserWindow, ipcMain } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS3_DEVTOOLS } from "electron-devtools-installer";
import { EVENT_START_SERVER, EVENT_STOP_SERVER } from "@/consts/custom-events";

import { addCertificate} from "@/services/certificate";
import { patchHostsFile, unpatchHostsFile } from "@/services/hosts";
import { startMapServer, stopNginxServer } from "@/services/mapServer";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import log from "electron-log";
import path from "path";
// @ts-ignore
import Store from "electron-store";

const isDevelopment = process.env.NODE_ENV !== "production";

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

async function createWindow() {
  Store.initRenderer();
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env
        .ELECTRON_NODE_INTEGRATION as unknown as boolean,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
    autoUpdater.checkForUpdatesAndNotify()
  }
}

// Quit when all windows are closed.
app.on("window-all-closed", async () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  try {
    await StopServer();
  } catch (e) {
    //Ignore any error
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}

ipcMain.handle(EVENT_START_SERVER, async (event, arg) => {
  const { proxyAddress, selectedServer } = arg;

  try {
    await stopNginxServer();
  } catch (e) {
    //ignore
  }

  try {
    await addCertificate();
    patchHostsFile();
    await startMapServer(proxyAddress, selectedServer);
    log.info("Start map server success");
    return { success: true };
  } catch (e) {
    log.error("Start map server failed", e);
    return { success: false, error: e };
  }
});

ipcMain.handle(EVENT_STOP_SERVER, async (event, arg) => {
  try {
    await StopServer();
    log.info("Stop server success");
    return { success: true };
  } catch (e) {
    log.error("Stop server failed", e);
    return { success: false, error: e };
  }
});

async function StopServer() {
  unpatchHostsFile();
  await stopNginxServer();
}
