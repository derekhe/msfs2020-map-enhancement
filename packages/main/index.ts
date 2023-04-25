
import { app, BrowserWindow, shell, protocol, ipcMain } from "electron";
import { release } from "os";
import { join } from "path";
import Store from "electron-store";
import log from "electron-log";
import {
  EVENT_CHECK_PORT,
  EVENT_CHECK_UPDATE,
  EVENT_START_GAME,
  EVENT_START_SERVER,
  EVENT_STOP_SERVER
} from "../consts/custom-events";

import { addCertificate } from "../services/certificate";
import { patchHostsFile, unpatchHostsFile } from "../services/hosts";
import { startMapServer, stopServer } from "../services/mapServer";
import { startGame } from "../services/game";
import { autoUpdater } from "electron-updater";


// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
]);

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

let win: BrowserWindow | null = null;

async function createWindow() {
  Store.initRenderer();

  win = new BrowserWindow({
    title: "Main window",
    webPreferences: {
      preload: join(__dirname, "../preload/index.cjs"),
      nodeIntegration: true,
      contextIsolation: false
    },
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#424659",
      symbolColor: "#74b1be"
    },
    width: 1024,
    height: 900
  });

  if (app.isPackaged) {
    win.loadFile(join(__dirname, "../renderer/index.html"));
  } else {
    // 🚧 Use ['ENV_NAME'] avoid vite:define plugin
    const url = `http://${process.env["VITE_DEV_SERVER_HOST"]}:${process.env["VITE_DEV_SERVER_PORT"]}`;

    win.loadURL(url);
    win.webContents.openDevTools()
  }

  // Test active push message to Renderer-process
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  win.webContents.on("new-window", function(e, url) {
    e.preventDefault();
    require("electron").shell.openExternal(url);
  });
}

app.whenReady().then(createWindow);

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", async () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    await createWindow();
  }
});

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

ipcMain.handle(EVENT_START_SERVER, async (event, arg) => {
  log.info("Staring server with", JSON.stringify(arg));

  try {
    log.info("Trying to stop any nginx server");
    await stopServer();
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

async function StopServer() {
  unpatchHostsFile();
  await stopServer();
}

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

ipcMain.handle(EVENT_START_GAME, async (event, arg) => {
  await startGame(arg["distributor"]);
});

