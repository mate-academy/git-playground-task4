const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const { execFileSync, spawnSync } = require("child_process");

const NOTES_FILE = path.join(__dirname, "..", "notes.json");
const CLI = path.join(__dirname, "..", "notes.js");
const run = (...args) => spawnSync("node", [CLI, ...args], { encoding: "utf8" });

function withCleanStore(fn) {
  const backup = fs.existsSync(NOTES_FILE) ? fs.readFileSync(NOTES_FILE) : null;
  fs.rmSync(NOTES_FILE, { force: true });
  try {
    fn();
  } finally {
    if (backup) fs.writeFileSync(NOTES_FILE, backup);
    else fs.rmSync(NOTES_FILE, { force: true });
  }
}

test("edit updates an existing note", () => {
  withCleanStore(() => {
    run("add", "old");
    assert.match(run("edit", "1", "new text").stdout, /Updated note #1/);
    assert.match(run("list").stdout, /#1 {2}new text/);
  });
});

test("edit reports a missing note instead of crashing", () => {
  withCleanStore(() => {
    const r = run("edit", "99", "hi");
    assert.strictEqual(r.status, 0);
    assert.match(r.stdout, /No note #99 found/);
  });
});

test("edit rejects a non-numeric id and empty text", () => {
  withCleanStore(() => {
    run("add", "keep me");
    assert.match(run("edit", "abc", "x").stdout, /Usage: notes edit/);
    assert.match(run("edit", "1").stdout, /Usage: notes edit/);
    assert.match(run("list").stdout, /keep me/);
  });
});

test("a corrupt notes.json is not silently overwritten", () => {
  withCleanStore(() => {
    fs.writeFileSync(NOTES_FILE, "{ not json");
    const r = run("add", "new");
    assert.notStrictEqual(r.status, 0);
    assert.strictEqual(fs.readFileSync(NOTES_FILE, "utf8"), "{ not json");
  });
});
