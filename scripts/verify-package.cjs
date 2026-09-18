const fs = require("node:fs/promises");
const path = require("node:path");

module.exports = async ({ appOutDir }) => {
  const root = path.join(appOutDir, "resources", "app");
  const packaged = JSON.parse(await fs.readFile(path.join(root, "package.json"), "utf8"));
  if (packaged.version !== require("../package.json").version)
    throw new Error("Packaged application version differs from source");
  for (const file of [
    "electron/dist/main.js",
    "electron/dist/preload.js",
    ".output/server/index.mjs",
  ]) {
    await fs.access(path.join(root, file));
  }
  const assets = await fs.readdir(path.join(root, ".output/public/assets"));
  if (!assets.some((file) => file.endsWith(".js")))
    throw new Error("Packaged renderer assets missing");
};
