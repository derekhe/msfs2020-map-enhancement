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

  imageServer.stdout!.setEncoding("utf8");
  imageServer.stdout!.on("data", function (data) {
    log.info(data);
  });

  imageServer.stderr!.setEncoding("utf8");
  imageServer.stderr!.on("data", function (data) {
    log.info(data);
  });

  imageServer.on("close", function (code) {
    log.log("image server closed", code);
  });

  imageServer.on("error", (err) => {
    log.error("Failed to start image server", err);
  });

  log.info("Starting nginx server");
  nginxProcess = spawn("./nginx.exe", [], {
    cwd: path.join(__dirname, "../extra/nginx"),
  });

  nginxProcess.on("error", (err) => {
    log.error("Failed to start nginx", err);
  });

  log.info("Started nginx server");
}

export async function stopServer(): Promise<void> {
  log.info("Stopping server");

  if (imageServer) {
    imageServer.kill();
  } else {
    try {
      await execAsync("taskkill", ["/F", "/IM", "python.exe"], {
        shell: true,
      });
    } catch (e) {
      log.info(e);
    }
  }

  if (nginxProcess) {
    nginxProcess.kill();
  } else {
    try {
      await execAsync("taskkill", ["/F", "/IM", "nginx.exe"], {
        shell: true,
      });
    } catch (e) {
      log.info(e);
    }
  }
}
