import { fork, execFile } from "child_process";
import path from "path";
import log from "electron-log";
import util from "util";
const execAsync = util.promisify(execFile);

const isDevelopment = process.env.NODE_ENV !== "production";

export async function startMapServer(): Promise<void> {
  if (isDevelopment) {
    log.info("Starting koa server in dev env");
    fork(require.resolve("../../extra/server/server.js"));
  } else {
    log.info("Starting koa server in prod env");
    fork("./server.js", [], {
      cwd: path.join(__dirname, "../extra/server"),
    });
  }

  log.info("Starting nginx server in dev env");
  await execAsync("./nginx.exe", {
    cwd: path.join(__dirname, "../extra/nginx"),
  });
}

export async function stopMapServer(): Promise<void> {
  log.info("Stopping nginx server");
  await execAsync("./nginx.exe", ["-s", "stop"], {
    cwd: path.join(__dirname, "../extra/nginx"),
  });
}
