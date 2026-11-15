const test = require("node:test");
const assert = require("node:assert");

const { matches } = require("../lib/store");

const notes = [
  { id: 1, text: "buy milk" },
  { id: 2, text: "call the bank" },
  { id: 3, text: "milk the almonds" },
];

test("search finds every note that contains the term", () => {
  const result = matches(notes, "milk");
  assert.strictEqual(result.length, 2);
});

test("search finds a single containing note", () => {
  const result = matches(notes, "bank");
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].id, 2);
});

test("search returns nothing when no note contains the term", () => {
  const result = matches(notes, "xyz");
  assert.strictEqual(result.length, 0);
});

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const cli = path.join(__dirname, "..", "notes.js");

function run(file, ...args) {
  return spawnSync("node", [cli, ...args], {
    env: { ...process.env, NOTES_FILE: file },
    encoding: "utf8",
  });
}

function tmpFile() {
  return path.join(fs.mkdtempSync(path.join(os.tmpdir(), "notes-")), "notes.json");
}

test("edit updates an existing note", () => {
  const file = tmpFile();
  run(file, "add", "old");
  const res = run(file, "edit", "1", "new text");
  assert.match(res.stdout, /Updated note #1/);
  assert.match(run(file, "list").stdout, /#1\s+new text/);
});

test("edit reports an unknown id instead of crashing", () => {
  const file = tmpFile();
  const res = run(file, "edit", "99", "hi");
  assert.strictEqual(res.status, 0);
  assert.match(res.stdout, /No note #99 found/);
});

test("edit rejects a non-numeric id or empty text", () => {
  const file = tmpFile();
  run(file, "add", "keep me");
  assert.match(run(file, "edit", "abc", "hi").stdout, /Usage: notes edit/);
  assert.match(run(file, "edit", "1").stdout, /Usage: notes edit/);
  assert.match(run(file, "list").stdout, /keep me/);
});

test("a corrupt data file is not overwritten", () => {
  const file = tmpFile();
  fs.writeFileSync(file, "{not json");
  const res = run(file, "add", "x");
  assert.notStrictEqual(res.status, 0);
  assert.strictEqual(fs.readFileSync(file, "utf8"), "{not json");
});
