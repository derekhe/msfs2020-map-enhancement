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
    cacheSizeGB,
    mapboxAccessToken,
    enableHighLOD,
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

  if (cacheEnabled) {
    args.push("--cacheEnabled", cacheEnabled);
  }

  if(cacheSizeGB){
    args.push("--cacheSizeGB", cacheSizeGB);
  }

  if (enableHighLOD) {
    args.push("--enableHighLOD", enableHighLOD);
  }

  log.info("Starting image server");

  imageServer = spawn("./python/python.exe", args, {
    cwd: path.join(__dirname, "../../extra/server"),
    stdio: "ignore",
  });

  log.info("Starting nginx server");
  nginxProcess = spawn("./nginx.exe", [], {
    cwd: path.join(__dirname, "../../extra/nginx"),
    stdio: "ignore",
  });

  nginxProcess.on("error", (err) => {
    log.error("Failed to start nginx", err);
  });

  log.info("Started nginx server");
}

function setupLog(process: ChildProcess, name: string) {
  process.stdout!.setEncoding("utf8");
  process.stdout!.on("data", function (data) {
    log.info(`${name}:`, data);
  });

  process.stderr!.setEncoding("utf8");
  process.stderr!.on("error", function (data) {
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
