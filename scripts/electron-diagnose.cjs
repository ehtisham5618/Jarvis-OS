// Launch with Electron to capture the real main/preload/renderer startup chain.
const { app, BrowserWindow } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const started = Date.now();
const output = path.resolve("diagnostics");
fs.mkdirSync(output, { recursive: true });
app.setPath("userData", path.join(output, "test-profile"));
const report = (type, data) =>
  console.log(JSON.stringify({ ms: Date.now() - started, type, data }));
process.on("uncaughtException", (e) => report("main-error", e.stack));
process.on("unhandledRejection", (e) => report("main-rejection", String(e)));
app.on("web-contents-created", (_, contents) => {
  contents.on("console-message", (event) =>
    report("renderer-console", {
      level: event.level,
      message: event.message,
      source: event.sourceId,
      line: event.lineNumber,
    }),
  );
  contents.on("preload-error", (_, file, error) =>
    report("preload-error", { file, error: String(error) }),
  );
  contents.on("did-fail-load", (_, code, description, url) =>
    report("load-error", { code, description, url }),
  );
  contents.on("render-process-gone", (_, details) => report("renderer-gone", details));
  contents.on("did-finish-load", async () => {
    if (contents.getURL().startsWith("devtools:")) return;
    report("loaded", contents.getURL());
    setTimeout(async () => {
      try {
        report(
          "page",
          await contents.executeJavaScript(
            "({text:document.body.innerText.slice(0,2000),bridge:!!window.jarvisOS})",
          ),
        );
        fs.writeFileSync(path.join(output, "startup.png"), (await contents.capturePage()).toPNG());
      } catch (e) {
        report("inspect-error", String(e));
      }
    }, 12000);
  });
});
app.on("browser-window-created", (_, win) =>
  win.on("unresponsive", () => report("unresponsive", win.id)),
);
require("../electron/dist/main.js");
setTimeout(() => {
  report("finish", app.getAppMetrics());
  app.exit();
}, 45000);
