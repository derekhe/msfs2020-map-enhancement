import fs from "fs";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import log from "electron-log";

export function patchHostsFile(): void {
  log.info("Patching hosts");

  let hostsFilePath = findHostsFile();
  log.info(`Find host file ${hostsFilePath}`);
  let hosts = fs.readFileSync(hostsFilePath).toString();

  if (hosts.indexOf("kh.ssl.ak.tiles.virtualearth.net") !== -1) {
    log.info("Already patched, skip");
    return;
  }

  hosts +=
    "\n127.0.0.1 kh.ssl.ak.tiles.virtualearth.net\r\n127.0.0.1 khstorelive.azureedge.net\r\n";
  fs.writeFileSync(hostsFilePath, hosts, {
    flag: "w"
  });
  log.info("Hosts patched", hosts);
}

export function unpatchHostsFile(): void {
  let hostsFilePath = findHostsFile();
  log.info("Unpatching hosts");
  let hosts = fs
    .readFileSync(hostsFilePath)
    .toString();
  hosts = hosts
    .replaceAll("127.0.0.1 kh.ssl.ak.tiles.virtualearth.net\r\n", "")
    .replaceAll("127.0.0.1 khstorelive.azureedge.net\r\n", "")
    .replace(/^\s*\n/gm, "");

  fs.writeFileSync(hostsFilePath, hosts);
  log.info("Hosts unpatched", hosts);
}

function findHostsFile() {
  for (let i = 67; i < 91; i++) {
    const driverLetter = String.fromCharCode(i);
    const hostPath = `${driverLetter}:\\windows\\system32\\drivers\\etc\\hosts`;
    if (fs.existsSync(hostPath)) {
      return hostPath;
    }
  }

  throw new Error("Can't find host file");
}