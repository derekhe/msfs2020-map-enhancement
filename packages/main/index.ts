import { app, BrowserWindow, crashReporter, dialog, ipcMain, protocol, shell } from "electron";
import path, { join, resolve } from "path";
import Store from "electron-store";
import log from "electron-log";
import {
  EVENT_CHECK_PORT,
  EVENT_CHECK_UPDATE,
  EVENT_COLLECT_LOGS,
  EVENT_START_GAME,
  EVENT_START_SERVER,
  EVENT_STOP_SERVER
} from "../consts/custom-events";

import { addCertificate } from "../services/certificate";
import { patchHostsFile, unpatchHostsFile } from "../services/hosts";
import { startMapServer, stopServer } from "../services/mapServer";
import { startGame } from "../services/game";
import { autoUpdater } from "electron-updater";

import { initialize } from "@electron/remote/main";
import { enable } from "@electron/remote/dist/src/main/server";
// @ts-ignore
import adm_zip from "adm-zip";
import moment from "moment";
// @ts-ignore
import { v4 as uuidv4 } from "uuid";

crashReporter.start({
  productName: "msfs2020-map-enhancement",
  companyName: "msfs2020-map-enhancement",
  submitURL: "https://submit.backtrace.io/msfs2020-map-enhancement/fc1803fa0c138e6c031608032a5dfc130609f0a868796d52320cb9d89258abdd/minidump",
  uploadToServer: true
});

log.transports.remote.level = "info";
log.transports.remote.url = "http://tx.k8s.april1985.com/msfs2020/log";

app.commandLine.appendSwitch("--no-sandbox");

initialize();

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
let status = {
  isServerRunning: false
};

async function createWindow() {
  Store.initRenderer();
  let store = new Store();
  let config = store.get("config", { userId: uuidv4() }) as object;
  // @ts-ignore
  log.transports.remote.client = { "uuid": config.userId };
  log.info("Application started");
  log.info("Version: " + app.getVersion());

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
    height: 900,
    minWidth: 1024,
    minHeight: 900,
    icon: "./resources/public/icon.png"
  });

  enable(win.webContents);

  if (app.isPackaged) {
    await win.loadFile(join(__dirname, "../renderer/index.html"));
  } else {
    // 🚧 Use ['ENV_NAME'] avoid vite:define plugin
    const url = `http://${process.env["VITE_DEV_SERVER_HOST"]}:${process.env["VITE_DEV_SERVER_PORT"]}`;

    await win.loadURL(url);
    await win.webContents.session.loadExtension(resolve("./tools/vue-devtools/6.1.4_0"));
    //win.webContents.openDevTools();
  }

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  win.on("close", (e) => {
    if (status.isServerRunning) {
      let response = dialog.showMessageBoxSync(win!, {
        type: "question",
        buttons: ["Yes, please", "No, thanks"],
        defaultId: 2,
        title: "Question",
        message: "Mod is still running, do you want to quit?"
      });

      if (response == 1) {
        e.preventDefault();
      }
    }
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
  log.info("Application closed");
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
  status.isServerRunning = false;
  log.info("Staring server with", JSON.stringify(arg));

  try {
    log.info("Trying to stop any nginx server");
    await stopServer();
  } catch (e) {
    log.info("Stop nginx server with error but it can ignore", e);
  }

  try {
    await addCertificate();
    await patchHostsFile();
    await startMapServer(JSON.stringify(arg));
    log.info("Start map server success");
    status.isServerRunning = true;
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
  status.isServerRunning = false;
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

ipcMain.handle(EVENT_COLLECT_LOGS, () => {
  const appLog = (path.dirname(log.transports.file.getFile().path));
  const nginxLog = app.isPackaged ? path.join(__dirname, "../../../extra/nginx/logs/") : path.join(__dirname, "../../extra/nginx/logs/");
  const imageServerLog = app.isPackaged ? path.join(__dirname, "../../../extra/server/logs/") : path.join(__dirname, "../../extra/server/logs/");

  log.info("Found log files in", appLog, nginxLog, imageServerLog);
  log.info("Creating zip file");

  const zip = new adm_zip();
  zip.addLocalFolder(appLog);
  zip.addLocalFolder(nginxLog);
  zip.addLocalFolder(imageServerLog);

  let targetFileName = path.join(appLog, "../" + moment().format("YYYYMMDDHHmmss") + ".zip");

  log.info("Filename", targetFileName);
  zip.writeZip(targetFileName);
  log.info("Done creating zip file");

  return targetFileName;
});