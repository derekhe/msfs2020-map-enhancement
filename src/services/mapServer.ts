import { fork, execFile, ChildProcess } from "child_process";
import path from "path";
import log from "electron-log";
import util from "util";

const execAsync = util.promisify(execFile);

const isDevelopment = process.env.NODE_ENV !== "production";
let serverProcess: ChildProcess;

export async function startMapServer(proxyAddress: string, selectedServer: string): Promise<void> {
  if(serverProcess){
    serverProcess.kill()
  }

  if (isDevelopment) {
    log.info("Starting koa server in dev env");
    serverProcess = fork("extra/server/server.js", [proxyAddress, selectedServer]);
  } else {
    log.info("Starting koa server in prod env");
    serverProcess = fork("./server.js", [], {
      cwd: path.join(__dirname, "../extra/server"),
      execArgv: [proxyAddress, selectedServer]
    });
  }

  log.info("Starting nginx server in dev env");
  await execAsync("./nginx.exe", {
    cwd: path.join(__dirname, "../extra/nginx")
  });
}

export async function stopMapServer(): Promise<void> {
  log.info("Stopping nginx server");
  await execAsync("./nginx.exe", ["-s", "stop"], {
    cwd: path.join(__dirname, "../extra/nginx")
  });

  serverProcess.kill()
}
