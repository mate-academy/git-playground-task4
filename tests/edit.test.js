const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const NOTES = path.join(__dirname, "..", "notes.js");

function setup() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "notes-"));
  const file = path.join(dir, "notes.json");
  const run = (...args) =>
    spawnSync(process.execPath, [NOTES, ...args], {
      env: { ...process.env, NOTES_FILE: file },
      encoding: "utf8",
    });
  return { file, run };
}

test("edit updates the text of an existing note", () => {
  const { file, run } = setup();
  run("add", "old");
  const res = run("edit", "1", "new", "text");
  assert.match(res.stdout, /Updated note #1/);
  assert.strictEqual(JSON.parse(fs.readFileSync(file, "utf8")).notes[0].text, "new text");
});

test("edit reports an unknown id without crashing", () => {
  const { run } = setup();
  run("add", "x");
  const res = run("edit", "99", "hello");
  assert.strictEqual(res.status, 0);
  assert.match(res.stdout, /No note #99 found/);
});

test("edit rejects a non-numeric id", () => {
  const { run } = setup();
  const res = run("edit", "abc", "hello");
  assert.strictEqual(res.status, 0);
  assert.match(res.stdout, /Usage: notes edit/);
});

test("edit rejects missing text and leaves the note unchanged", () => {
  const { file, run } = setup();
  run("add", "keep me");
  const res = run("edit", "1");
  assert.match(res.stdout, /Usage: notes edit/);
  assert.strictEqual(JSON.parse(fs.readFileSync(file, "utf8")).notes[0].text, "keep me");
});

test("a corrupt notes file is not overwritten", () => {
  const { file, run } = setup();
  fs.writeFileSync(file, "{not json");
  const res = run("add", "x");
  assert.notStrictEqual(res.status, 0);
  assert.strictEqual(fs.readFileSync(file, "utf8"), "{not json");
});
