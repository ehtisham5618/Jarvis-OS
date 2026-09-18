const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const yaml = require("js-yaml");

async function digest(file, algorithm, encoding = "hex") {
  const hash = crypto.createHash(algorithm);
  for await (const chunk of fs.createReadStream(file)) hash.update(chunk);
  return hash.digest(encoding);
}

async function main() {
  const directory = path.resolve(process.argv[2] || "release");
  const { version } = require("../package.json");
  const installer = `Jarvis-Setup-${version}.exe`;
  const metadata = yaml.load(fs.readFileSync(path.join(directory, "latest.yml"), "utf8"));
  assert.equal(metadata.version, version, "Updater version differs from source");
  assert.equal(metadata.path, installer, "Updater path differs from installer name");
  assert.equal(metadata.files.length, 1, "Expected one Windows installer");
  const entry = metadata.files[0];
  assert.equal(entry.url, installer);
  const binary = path.join(directory, installer);
  assert.equal(entry.size, fs.statSync(binary).size);
  const sha512 = await digest(binary, "sha512", "base64");
  assert.equal(entry.sha512, sha512, "Updater installer hash mismatch");
  assert.equal(metadata.sha512, sha512);
  const names = [installer, `${installer}.blockmap`, "latest.yml"];
  const checksums = [];
  for (const name of names) {
    checksums.push(`${await digest(path.join(directory, name), "sha256")}  ${name}`);
  }
  fs.writeFileSync(path.join(directory, "SHA256SUMS.txt"), checksums.join("\n") + "\n");
  console.log(
    `Verified v${version}: installer name, size, SHA-512, blockmap, and update metadata.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
