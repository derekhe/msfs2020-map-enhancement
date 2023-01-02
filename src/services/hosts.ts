import fs from "fs";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import log from "electron-log";

export function patchHostsFile(): void {
  log.info("Patching hosts");
  let hosts = fs
    .readFileSync("C:\\windows\\system32\\drivers\\etc\\hosts")
    .toString();
  hosts +=
    "\n127.0.0.1 kh.ssl.ak.tiles.virtualearth.net\n127.0.0.1 khstorelive.azureedge.net\n";
  fs.writeFileSync("C:\\windows\\system32\\drivers\\etc\\hosts", hosts);
}

export function unpatchHostsFile(): void {
  log.info("Unpatching hosts");
  let hosts = fs
    .readFileSync("C:\\windows\\system32\\drivers\\etc\\hosts")
    .toString();
  hosts = hosts
    .replaceAll("127.0.0.1 kh.ssl.ak.tiles.virtualearth.net\n", "")
    .replaceAll("127.0.0.1 khstorelive.azureedge.net\n", "")
    .replaceAll("\n\n", "\n");

  log.info(hosts)
  fs.writeFileSync("C:\\windows\\system32\\drivers\\etc\\hosts", hosts);
}
