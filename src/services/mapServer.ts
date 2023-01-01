import { fork, execFile, spawn, ChildProcess } from "child_process";
import path from "path";
import log from "electron-log";
import util from "util";

const execAsync = util.promisify(execFile);

const isDevelopment = process.env.NODE_ENV !== "production";
let serverProcess: ChildProcess;

export async function startMapServer(
  proxyAddress: string,
  selectedServer: string
): Promise<void> {
  if (serverProcess) {
    serverProcess.kill();
  }

  if (isDevelopment) {
    log.info("Starting koa server in dev env");
    serverProcess = fork("extra/server/server.js", [
      "--proxyAddress",
      proxyAddress,
      "--selectedServer",
      selectedServer,
    ]);
    log.info("Started koa server in dev env");
  } else {
    log.info("Starting koa server in prod env");
    serverProcess = fork("./server.js", [], {
      cwd: path.join(__dirname, "../extra/server"),
      execArgv: [proxyAddress, selectedServer],
    });
    log.info("Started koa server in prod env");
  }

  log.info("Starting nginx server");
  const nginxProcess = spawn("./nginx.exe", [], {
    cwd: path.join(__dirname, "../extra/nginx"),
  });

  nginxProcess.on("error", (err) => {
    console.error("Failed to start nginx", err);
  });

  log.info("Started nginx server");
}

export async function stopNginxServer(): Promise<void> {
  log.info("Stopping nginx server");

  await execAsync("taskkill", ["/F", "/IM", "nginx.exe"], {
    shell:true,
  })

  serverProcess.kill();
}

