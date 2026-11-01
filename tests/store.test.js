const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "notes-"));
process.env.NOTES_FILE = path.join(tmp, "notes.json");
const store = require("../lib/store");

function reset() {
  fs.rmSync(process.env.NOTES_FILE, { force: true });
}

test("add assigns incrementing ids", () => {
  reset();
  assert.strictEqual(store.add("a").id, 1);
  assert.strictEqual(store.add("b").id, 2);
  assert.strictEqual(store.all().length, 2);
});

test("edit updates the text of an existing note", () => {
  reset();
  store.add("old");
  assert.strictEqual(store.edit(1, "new"), true);
  assert.strictEqual(store.all()[0].text, "new");
});

test("edit returns false and does not throw for an unknown id", () => {
  reset();
  store.add("keep");
  assert.strictEqual(store.edit(99, "x"), false);
  assert.deepStrictEqual(store.all().map((n) => n.text), ["keep"]);
});

test("remove deletes an existing note and reports unknown ids", () => {
  reset();
  store.add("a");
  assert.strictEqual(store.remove(1), true);
  assert.strictEqual(store.remove(1), false);
});

test("CLI edit reports a missing note instead of crashing", () => {
  reset();
  const run = (...args) =>
    execFileSync("node", [path.join(__dirname, "..", "notes.js"), ...args], {
      env: process.env,
      encoding: "utf8",
    });
  run("add", "hello");
  assert.match(run("edit", "1", "world"), /Updated note #1/);
  assert.match(run("edit", "42", "x"), /No note #42 found/);
  assert.match(run("edit", "1"), /Usage: notes edit/);
});
