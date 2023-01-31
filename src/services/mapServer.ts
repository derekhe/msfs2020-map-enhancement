import { fork, execFile, spawn, ChildProcess } from "child_process";
import path from "path";
import log from "electron-log";
import util from "util";

const execAsync = util.promisify(execFile);

const isDevelopment = process.env.NODE_ENV !== "production";
let serverProcess: ChildProcess;

export async function startMapServer(arg: any): Promise<void> {
  log.info("Starting map server");
  if (serverProcess) {
    serverProcess.kill();
  }

  const {
    proxyAddress,
    selectedServer,
    cacheLocation,
    cacheEnabled,
    mapboxAccessToken,
  } = arg;

  let args = [
    "--proxyAddress",
    proxyAddress,
    "--selectedServer",
    selectedServer,
    "--cacheLocation",
    cacheLocation,
    "--cacheEnabled",
    cacheEnabled,
    "--mapboxAccessToken",
    mapboxAccessToken,
  ];

  if (isDevelopment) {
    log.info("Starting koa server in dev env");
    serverProcess = fork("extra/server/server.js", args);
    log.info("Started koa server in dev env");
  } else {
    log.info("Starting koa server in prod env");
    serverProcess = fork("./server.js", args, {
      cwd: path.join(__dirname, "../extra/server"),
    });
    log.info("Started koa server in prod env");
  }

  log.info("Starting nginx server");
  const nginxProcess = spawn("./nginx.exe", [], {
    cwd: path.join(__dirname, "../extra/nginx"),
  });

  nginxProcess.on("error", (err) => {
    log.error("Failed to start nginx", err);
  });

  log.info("Started nginx server");
}

export async function stopNginxServer(): Promise<void> {
  log.info("Stopping nginx server");

  await execAsync("taskkill", ["/F", "/IM", "nginx.exe"], {
    shell: true,
  });

  serverProcess.kill();
}
