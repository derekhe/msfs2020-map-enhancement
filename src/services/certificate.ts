import { execFile } from "child_process";
import path from "path";
import log from "electron-log";
import util from "util";

const execAsync = util.promisify(execFile);

export const addCertificate = async (): Promise<void> => {
  const { stdout } = await execAsync(
    "certutil",
    ["-addstore", "-f", "root", "cert.crt"],
    {
      cwd: path.join(__dirname, "../extra/certs"),
      shell: true,
    }
  );
  log.info(stdout);
};

export const removeCertificate = async (): Promise<void> => {
  const { stdout } = await execAsync(
    "certutil",
    ["-delstore", "-f", "root", "cert.crt"],
    {
      cwd: path.join(__dirname, "../extra/certs"),
      shell: true,
    }
  );
  log.info(stdout);
};