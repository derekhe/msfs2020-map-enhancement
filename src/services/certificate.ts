import { execFile } from "child_process";
import path from "path";
// @ts-ignore
import log from "electron-log";
import util from "util";

const execAsync = util.promisify(execFile);

export const addCertificate = async (): Promise<void> => {
  const { stdout } = await execAsync(
    "mkcert.exe",
    [
      "-install",
      "-key-file",
      "key.pem",
      "-cert-file",
      "cert.pem",
      "kh.ssl.ak.tiles.virtualearth.net",
      "khstorelive.azureedge.net",
      "*.virtualearth.net",
      "*.azureedge.net",
    ],
    {
      cwd: path.join(__dirname, "../extra/nginx/conf"),
      shell: true,
    }
  );
  log.info(stdout);
};
