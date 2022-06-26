import { ChildProcess, execFile, spawn } from "child_process";
import path from "path";
import log from "electron-log";
import util from "util";
import { app } from "electron";
import fs from "fs";

const execAsync = util.promisify(execFile);
let imageServer: ChildProcess;
let nginxProcess: ChildProcess;

export async function startMapServer(options: string, license: string): Promise<void> {
  log.info("Starting map server");

  let args = ["server.py"];
  args.push("--config", options);

  let pythonProgramDir = app.isPackaged ? path.join(__dirname, "../../../extra/server/dist") : path.join(__dirname, "../../extra/server/dist");
  if (license) {
    fs.writeFileSync(path.join(pythonProgramDir, "license.lic"), license, { flag: "w", encoding: "utf-8" });
  }

  imageServer = spawn("../python/pymsfs2020.exe", args, {
    cwd: pythonProgramDir,
    stdio: "ignore"
  });

  log.info("Starting nginx server");
  nginxProcess = spawn("./nginx.exe", [], {
    cwd: app.isPackaged ? path.join(__dirname, "../../../extra/nginx") : path.join(__dirname, "../../extra/nginx"),
    stdio: "ignore"
  });

  imageServer.on("close", function(code) {
    log.log(`Image server closed`, code);
  });

  imageServer.on("error", (err) => {
    log.error(`Image server Failed to start process`, err);
  });

  nginxProcess.on("close", function(code) {
    log.log(`Nginx Process closed`, code);
  });

  nginxProcess.on("error", (err) => {
    log.error(`Nginx Failed to start process`, err);
  });

  log.info("Started nginx server");
}

export async function stopServer(): Promise<void> {
  log.info("Force killing server");

  try {
    await execAsync("taskkill", ["/F", "/IM", "pymsfs2020.exe"], {
      shell: true
    });
  } catch (e) {
    log.info(e);
  }

  try {
    await execAsync("taskkill", ["/F", "/IM", "nginx.exe"], {
      shell: true
    });
  } catch (e) {
    log.info(e);
  }
}
