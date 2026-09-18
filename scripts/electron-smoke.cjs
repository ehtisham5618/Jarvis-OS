const { app, ipcMain, BrowserWindow, session } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { setTimeout: delay } = require("node:timers/promises");
const output = path.resolve("diagnostics");
fs.mkdirSync(output, { recursive: true });
app.setPath("userData", path.join(output, "smoke-profile"));
const start = Date.now();
const results = [];
const errors = [];
app.on("will-quit", (event) => {
  if (process.exitCode) {
    event.preventDefault();
    setImmediate(() => app.exit(Number(process.exitCode)));
  }
});
const record = (name, data) => {
  results.push({ name, ms: Date.now() - start, data });
  console.log(JSON.stringify(results.at(-1)));
};
process.on("uncaughtException", (error) => errors.push(String(error.stack)));
process.on("unhandledRejection", (error) => errors.push(String(error)));
app.on("web-contents-created", (_, contents) => {
  contents.on("console-message", (event) => {
    if (event.level === "error") {
      errors.push(event.message);
      record("renderer-error", event.message);
    }
  });
  contents.on("preload-error", (_, file, error) => errors.push(`${file}: ${error}`));
  contents.on("render-process-gone", (_, details) => errors.push(JSON.stringify(details)));
});
app.on("browser-window-created", (_, window) => {
  record("window-created");
  window.on("unresponsive", () => errors.push("Window unresponsive"));
});
app.whenReady().then(() => {
  if (process.env.JARVIS_TEST_OFFLINE === "1") {
    session.defaultSession.webRequest.onBeforeRequest(
      { urls: ["http://localhost:11434/*", "http://127.0.0.1:11434/*"] },
      (_, callback) => callback({ cancel: true }),
    );
  }
});
let began = false;
const ready = () => new Promise((resolve) => ipcMain.once("app:renderer-ready", resolve));
ipcMain.on("app:renderer-ready", async () => {
  if (began) return;
  began = true;
  try {
    record("renderer-ready");
    const win = BrowserWindow.getAllWindows()[0];
    const contents = win.webContents;
    const evaluate = (code) => contents.executeJavaScript(code);
    const origin = new URL(contents.getURL()).origin;
    await delay(1000);
    assert.equal(await evaluate("!!window.jarvisOS"), true);
    assert.ok((await evaluate("document.body.innerText")).includes("Jarvis"));
    record("bridge", await evaluate("window.jarvisOS.app.getVersion()"));
    record("hardware", await evaluate("window.jarvisOS.system.getMetrics()"));
    record(
      "process-count",
      await evaluate("window.jarvisOS.system.getProcesses().then(value=>value.length)"),
    );
    const workspace = process.cwd();
    const temp = path.join(output, "ipc-roundtrip.txt");
    record(
      "filesystem",
      await evaluate(
        `(async()=>{await window.jarvisOS.fs.writeFile(${JSON.stringify(temp)},'jarvis-smoke');return {text:await window.jarvisOS.fs.readFile(${JSON.stringify(temp)}),entries:(await window.jarvisOS.fs.listDir(${JSON.stringify(workspace)})).length}})()`,
      ),
    );
    record("shell", await evaluate("window.jarvisOS.shell.exec('node',['--version'])"));
    record("memory", await evaluate("window.jarvisOS.memory.list(1).then(rows=>rows.length)"));
    const memoryId = `smoke-${Date.now()}`;
    record(
      "memory-roundtrip",
      await evaluate(`(async()=>{
      const entry={id:${JSON.stringify(memoryId)},content:'integration test',source:'manual',tags:['test'],embedding:[1,0,0],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
      await window.jarvisOS.memory.store(entry);
      const rows=await window.jarvisOS.memory.search([1,0,0],1);
      await window.jarvisOS.memory.delete(entry.id);
      return rows.map(row=>row.id);
    })()`),
    );
    win.minimize();
    await delay(250);
    assert.ok(win.isMinimized());
    win.restore();
    win.show();
    await delay(250);
    assert.ok(!win.isMinimized());
    win.close();
    assert.ok(!win.isVisible());
    win.show();
    assert.ok(win.isVisible());
    record("minimize-restore-close-reopen", true);
    const routes = [
      "/chat",
      "/models",
      "/system",
      "/files",
      "/memory",
      "/automations",
      "/voice",
      "/terminal",
      "/projects",
      "/downloads",
      "/devices",
      "/history",
      "/developer",
      "/settings",
      "/setup",
      "/setup/profile",
      "/setup/ai",
      "/setup/complete",
      "/lock",
      "/missing-page",
      "/",
    ];
    for (const route of routes) {
      const readyEvent = ready();
      await contents.loadURL(origin + route);
      await Promise.race([
        readyEvent,
        delay(20000).then(() => {
          throw new Error(`Route timeout: ${route}`);
        }),
      ]);
      await delay(400);
      const text = await evaluate("document.body.innerText");
      assert.ok(text.length > 30, `Blank route ${route}`);
      assert.ok(!text.includes("Jarvis intercepted an error"), `Route error ${route}`);
      record("route", { route, characters: text.length });
    }
    if (process.env.JARVIS_TEST_CHAT === "1") {
      const nextReady = ready();
      await contents.loadURL(origin + "/chat");
      await nextReady;
      await delay(2000);
      await evaluate("document.querySelector('textarea').focus()");
      await contents.insertText("Reply with only the word READY.");
      await delay(100);
      await evaluate("document.querySelector('[aria-label=\"Send message\"]').click()");
      const deadline = Date.now() + 120000;
      let text = "";
      while (Date.now() < deadline) {
        await delay(1000);
        text = await evaluate("document.body.innerText");
        if (text.includes("Local AI could not respond")) throw new Error("Chat failed");
        if (
          !(await evaluate(
            "Array.from(document.querySelectorAll('button')).some(button=>button.textContent.trim()==='Stop')",
          ))
        )
          break;
      }
      record("chat", text.slice(-1200));
      const assistant = await evaluate(
        "Array.from(document.querySelectorAll('[data-message-role=assistant]')).at(-1)?.innerText || ''",
      );
      assert.ok(assistant.includes("READY"), `Chat response missing: ${assistant}`);
    }
    record("hardware-warm", await evaluate("window.jarvisOS.system.getMetrics()"));
    try {
      await delay(1000);
      fs.writeFileSync(path.join(output, "desktop.png"), (await contents.capturePage()).toPNG());
      record("screenshot", "desktop.png");
    } catch (error) {
      record("screenshot-unavailable", String(error));
    }
    const samples = [];
    let last = Date.now();
    let maxLag = 0;
    const heartbeat = setInterval(() => {
      const now = Date.now();
      maxLag = Math.max(maxLag, now - last - 100);
      last = now;
    }, 100);
    for (let i = 0; i < 5; i++) {
      await delay(1000);
      samples.push(
        app.getAppMetrics().map((p) => ({
          type: p.type,
          cpu: p.cpu.percentCPUUsage,
          workingSetKB: p.memory.workingSetSize,
        })),
      );
    }
    clearInterval(heartbeat);
    record("idle", { maxMainEventLoopLagMs: maxLag, samples });
    record("errors", errors);
    assert.equal(
      errors.filter((e) => !e.includes("ERR_BLOCKED_BY_CLIENT")).length,
      0,
      "Fatal console errors",
    );
    if (process.env.JARVIS_TEST_RECOVERY === "1") {
      const recoveryLoaded = new Promise((resolve) => contents.once("did-finish-load", resolve));
      contents.forcefullyCrashRenderer();
      await recoveryLoaded;
      assert.ok((await evaluate("document.body.innerText")).includes("could not finish loading"));
      const recovered = ready();
      await evaluate("void window.jarvisOS.app.retryStartup()");
      await recovered;
      assert.ok((await evaluate("document.body.innerText")).includes("Jarvis"));
      record("intentional-renderer-crash-recovered", true);
    }
    record("PASS", true);
  } catch (error) {
    record("FAIL", String(error.stack));
    process.exitCode = 1;
  } finally {
    fs.writeFileSync(
      path.join(
        output,
        `smoke-${process.env.JARVIS_TEST_OFFLINE === "1" ? "offline" : "online"}-${Date.now()}.json`,
      ),
      JSON.stringify(results, null, 2),
    );
    app.quit();
  }
});
require(process.env.JARVIS_TEST_MAIN || "../electron/dist/main.js");
setTimeout(() => {
  record("FAIL", "Overall startup/test timeout");
  process.exitCode = 1;
  fs.writeFileSync(
    path.join(output, `smoke-timeout-${Date.now()}.json`),
    JSON.stringify(results, null, 2),
  );
  app.quit();
}, 180000).unref();
