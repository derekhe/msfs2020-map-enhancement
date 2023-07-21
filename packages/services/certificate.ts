import { app } from "electron";
import { execFile } from "child_process";
import log from "electron-log";
import util from "util";
import path from "path";
// @ts-ignore

const execAsync = util.promisify(execFile);

export const addCertificate = async (): Promise<void> => {
  log.info("Adding certificate");
  const { stdout } = await execAsync(
    "mkcert.exe",
    [
      "-install",
      "-key-file",
      "key.pem",
      "-cert-file",
      "cert.pem",
      "*.virtualearth.net",
      "*.azureedge.net",
      "kh.ssl.ak.tiles.virtualearth.net",
      "khstorelive.azureedge.net",
    ],
    {
      cwd: app.isPackaged ? path.join(__dirname, "../../../extra/nginx/conf") : path.join(__dirname, "../../extra/nginx/conf"),
      shell: true
    }
  );
  log.info("Added certificate", stdout);
};
