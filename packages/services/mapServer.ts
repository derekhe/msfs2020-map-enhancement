import { fork, execFile, spawn, ChildProcess } from "child_process";
import path from "path";
import log from "electron-log";
import util from "util";

const execAsync = util.promisify(execFile);
let imageServer: ChildProcess;
let nginxProcess: ChildProcess;

export async function startMapServer(options: any): Promise<void> {
  log.info("Starting map server");

  let args = ["server.py"];
  args.push("--config", options);

  imageServer = spawn("./python/python.exe", args, {
    cwd: path.join(__dirname, "../../extra/server"),
    stdio: "ignore"
  });

  log.info("Starting nginx server");
  nginxProcess = spawn("./nginx.exe", [], {
    cwd: path.join(__dirname, "../../extra/nginx"),
    stdio: "ignore"
  });

  nginxProcess.on("close", function(code) {
    log.log(`Process closed`, code);
  });

  nginxProcess.on("error", (err) => {
    log.error(`Failed to start process`, err);
  });

  log.info("Started nginx server");
}

export async function stopServer(): Promise<void> {
  log.info("Force killing server");

  try {
    await execAsync("taskkill", ["/F", "/IM", "python.exe"], {
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
