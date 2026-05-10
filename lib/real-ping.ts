import { execFile } from "node:child_process";
import os from "node:os";
import { PING_SAMPLE_COUNT, PING_TIMEOUT_MS } from "@/lib/constants";
import { parsePingOutput } from "@/lib/ping-logic";

function pingArgs(host: string) {
  if (os.platform() === "win32") {
    return ["-n", String(PING_SAMPLE_COUNT), host];
  }

  return ["-c", String(PING_SAMPLE_COUNT), host];
}

export async function runRealPing(host: string) {
  return new Promise<ReturnType<typeof parsePingOutput>>((resolve, reject) => {
    execFile("ping", pingArgs(host), { timeout: PING_TIMEOUT_MS, windowsHide: true }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message || "Ping process failed."));
        return;
      }

      try {
        resolve(parsePingOutput(stdout));
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
}
