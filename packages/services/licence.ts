import { spawnSync } from "child_process";
import path from "path";
import log from "electron-log";
import { app } from "electron";
import fs from "fs";


export function checkLicence(license: string) {
  log.info("Checking licence" + license);

  let args = ["licence_check.py"];

  let pythonProgramDir = app.isPackaged ? path.join(__dirname, "../../../extra/server/dist") : path.join(__dirname, "../../extra/server/dist");
  if (license) {
    fs.writeFileSync(path.join(pythonProgramDir, "license.lic"), license, { flag: "w", encoding: "utf-8" });
  }

  let imageServer = spawnSync("../python/pymsfs2020.exe", args, {
    cwd: pythonProgramDir,
    stdio: "ignore"
  });

  log.info("Licence status:" + imageServer.status);
  return imageServer.status;
}