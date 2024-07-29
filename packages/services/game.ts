import log from "electron-log";
import util from "util";
import { execFile } from "child_process";

const execAsync = util.promisify(execFile);

export async function startGame(distributor: string): Promise<void> {
  if (distributor === "MS Store") {
    try {
      await execAsync(
        "start",
        [
          "shell:appsFolder\\Microsoft.FlightSimulator_8wekyb3d8bbwe!App",
          "-fastlaunch",
        ],
        {
          shell: true,
        }
      );
    } catch (e) {
      log.error(e);
    }
  }

  if (distributor === "Steam") {
    try {
      await execAsync("start", ["steam://run/1250410"], {
        shell: true,
      });
    } catch (e) {
      log.info(e);
    }
  }
}
