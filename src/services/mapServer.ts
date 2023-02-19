import { fork, execFile, spawn, ChildProcess } from "child_process";
import path from "path";
import log from "electron-log";
import util from "util";

const execAsync = util.promisify(execFile);
let imageServer: ChildProcess;
let nginxProcess: ChildProcess;

export async function startMapServer(arg: any): Promise<void> {
  log.info("Starting map server");

  const {
    proxyAddress,
    selectedServer,
    cacheLocation,
    cacheEnabled,
    mapboxAccessToken,
  } = arg;

  let args = ["server.py"];

  if (proxyAddress) {
    args.push("--proxyAddress", proxyAddress);
  }

  if (selectedServer) {
    args.push("--selectedServer", selectedServer);
  }

  if (cacheLocation) {
    args.push("--cacheLocation", cacheLocation);
  }

  if (mapboxAccessToken) {
    args.push("--mapboxAccessToken", mapboxAccessToken);
  }

  log.info("Starting image server");

  imageServer = spawn("./python/python.exe", args, {
    cwd: path.join(__dirname, "../extra/server"),
  });

  setupLog(imageServer, "Image Server");

  log.info("Starting nginx server");
  nginxProcess = spawn("./nginx.exe", [], {
    cwd: path.join(__dirname, "../extra/nginx"),
  });

  nginxProcess.on("error", (err) => {
    log.error("Failed to start nginx", err);
  });

  setupLog(nginxProcess, "Nginx Server");

  log.info("Started nginx server");
}

function setupLog(process: ChildProcess, name: string) {
  process.stdout!.setEncoding("utf8");
  process.stdout!.on("data", function (data) {
    log.info(`${name}:`, data);
  });

  process.stderr!.setEncoding("utf8");
  process.stderr!.on("data", function (data) {
    log.info(`${name}:`, data);
  });

  process.on("close", function (code) {
    log.log(`${name} Process closed`, code);
  });

  process.on("error", (err) => {
    log.error(`${name} Failed to start process`, err);
  });
}

export async function stopServer(): Promise<void> {
  log.info("Force killing server");

  try {
    await execAsync("taskkill", ["/F", "/IM", "python.exe"], {
      shell: true,
    });
  } catch (e) {
    log.info(e);
  }

  try {
    await execAsync("taskkill", ["/F", "/IM", "nginx.exe"], {
      shell: true,
    });
  } catch (e) {
    log.info(e);
  }
}
