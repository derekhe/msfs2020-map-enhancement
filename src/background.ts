"use strict";
import { autoUpdater } from "electron-updater";
import { app, protocol, BrowserWindow, ipcMain } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS3_DEVTOOLS } from "electron-devtools-installer";
import {
  EVENT_CHECK_PORT,
  EVENT_CHECK_UPDATE,
  EVENT_START_SERVER,
  EVENT_STOP_SERVER,
} from "@/consts/custom-events";

import { addCertificate } from "@/services/certificate";
import { patchHostsFile, unpatchHostsFile } from "@/services/hosts";
import { startMapServer, stopNginxServer } from "@/services/mapServer";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import log from "electron-log";

import path from "path";
// @ts-ignore
import Store from "electron-store";

const isDevelopment = process.env.NODE_ENV !== "production";

protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

async function createWindow() {
  Store.initRenderer();

  const win = new BrowserWindow({
    width: 800,
    height: 800,
    fullscreenable: false,
    fullscreen: false,
    maximizable: false,
    webPreferences: {
      nodeIntegration: process.env
        .ELECTRON_NODE_INTEGRATION as unknown as boolean,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, "preload.js"),
      enableRemoteModule: true,
    },
  });

  win.webContents.on("new-window", function (e, url) {
    e.preventDefault();
    require("electron").shell.openExternal(url);
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    win.loadURL("app://./index.html");
  }
}

app.on("window-all-closed", async () => {
  try {
    await StopServer();
  } catch (e) {
    log.info("Window closing, error", e);
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    try {
      await installExtension(VUEJS3_DEVTOOLS);
    } catch (e) {
      log.error("Vue Devtools failed to install:", e.toString());
    }
  }
  await createWindow();
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
  log.info("Staring server with", JSON.stringify(arg) );

  try {
    log.info("Trying to stop any nginx server");
    await stopNginxServer();
  } catch (e) {
    log.info("Stop nginx server with error but it can ignore", e);
  }

  try {
    await addCertificate();
    patchHostsFile();
    await startMapServer(arg);
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

ipcMain.handle(EVENT_CHECK_PORT, async () => {
  const tcpPortUsed = require("tcp-port-used");
  const result = await tcpPortUsed.check(443, "127.0.0.1");
  log.info("443 is in use:", result);
  return result;
});

ipcMain.handle(EVENT_CHECK_UPDATE, async () => {
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;
  let updateCheckResult = await autoUpdater.checkForUpdates();
  return updateCheckResult.updateInfo;
});

async function StopServer() {
  unpatchHostsFile();
  await stopNginxServer();
}
