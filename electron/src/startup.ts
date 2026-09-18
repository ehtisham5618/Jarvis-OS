import { spawn, type ChildProcess } from "child_process";
import { createServer } from "net";
import { setTimeout as delay } from "timers/promises";
import log from "electron-log";

export async function startRendererServer(
  executable: string,
  entry: string,
): Promise<{
  process: ChildProcess;
  url: string;
}> {
  const port = await new Promise<number>((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    // A stable origin preserves renderer settings and chat history between launches.
    server.listen(43123, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") return reject(new Error("No server port"));
      server.close((error) => (error ? reject(error) : resolve(address.port)));
    });
  });
  const url = `http://127.0.0.1:${port}`;
  const child = spawn(executable, [entry], {
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      NITRO_HOST: "127.0.0.1",
      NITRO_PORT: String(port),
      NODE_ENV: "production",
    },
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let failure: Error | undefined;
  child.once("error", (error) => {
    failure = error;
  });
  child.once("exit", (code) => {
    failure = new Error(`Renderer server exited (${code})`);
  });
  child.stdout?.on("data", (data: Buffer) => log.info("[startup:server]", data.toString().trim()));
  child.stderr?.on("data", (data: Buffer) => log.warn("[startup:server]", data.toString().trim()));
  const deadline = Date.now() + 30000;
  try {
    while (Date.now() < deadline) {
      if (failure) throw failure;
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(1500) });
        await response.body?.cancel();
        if (response.ok) return { process: child, url };
        if (response.status >= 500)
          throw new Error(`Renderer server returned HTTP ${response.status}`);
      } catch (error) {
        if (error instanceof Error && error.message.startsWith("Renderer server returned"))
          throw error;
      }
      await delay(200);
    }
    throw new Error("Renderer server did not become ready within 30 seconds");
  } catch (error) {
    child.kill();
    throw error;
  }
}

export function startupPage(failed = false): string {
  return `data:text/html;charset=utf-8,${encodeURIComponent(`<!doctype html><html lang="en"><meta charset="utf-8"><title>Jarvis</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#050608;color:#dbeafe;font:16px system-ui}main{text-align:center;max-width:480px;padding:32px}h1{color:#61c7ff;font-weight:400}button{padding:12px;margin:6px;border:1px solid #4f7dff;border-radius:10px;background:#111827;color:white;cursor:pointer}</style><main><h1>Jarvis</h1><p>${failed ? "Jarvis could not finish loading. Your workspace has been kept. Try again or open the diagnostic log." : "Starting your desktop..."}</p>${failed ? '<button onclick="window.jarvisOS.app.retryStartup()">Retry</button><button onclick="window.jarvisOS.app.openLogs()">Open diagnostic log</button>' : ""}<button onclick="window.jarvisOS.app.quit()">Quit</button></main></html>`)}`;
}
