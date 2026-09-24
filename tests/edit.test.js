const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

// Point the store at a temporary file so the tests never touch the real notes.json.
const FILE = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "notes-")), "notes.json");
process.env.NOTES_FILE = FILE;

const store = require("../lib/store");

const CLI = path.join(__dirname, "..", "notes.js");

function reset() {
  fs.writeFileSync(
    FILE,
    JSON.stringify({ nextId: 2, notes: [{ id: 1, text: "buy milk" }] })
  );
}

function notes(...args) {
  return execFileSync(process.execPath, [CLI, ...args], { encoding: "utf8" }).trim();
}

test("edit updates the text of an existing note", () => {
  reset();
  assert.strictEqual(store.edit(1, "buy oat milk"), true);
  assert.deepStrictEqual(store.all(), [{ id: 1, text: "buy oat milk" }]);
});

test("edit returns false and changes nothing when the id does not exist", () => {
  reset();
  assert.strictEqual(store.edit(99, "hello"), false);
  assert.deepStrictEqual(store.all(), [{ id: 1, text: "buy milk" }]);
});

test("edit command updates a note", () => {
  reset();
  assert.strictEqual(notes("edit", "1", "buy", "oat", "milk"), "Updated note #1");
  assert.strictEqual(store.all()[0].text, "buy oat milk");
});

test("edit command reports a missing note instead of crashing", () => {
  reset();
  assert.strictEqual(notes("edit", "99", "hello"), "No note #99 found");
});

test("edit command rejects a missing or non-numeric id", () => {
  reset();
  assert.match(notes("edit"), /^Usage: notes edit/);
  assert.match(notes("edit", "abc", "hello"), /^Usage: notes edit/);
  assert.strictEqual(store.all()[0].text, "buy milk");
});

test("edit command rejects empty text and keeps the note", () => {
  reset();
  assert.match(notes("edit", "1"), /^Usage: notes edit/);
  assert.match(notes("edit", "1", "   "), /^Usage: notes edit/);
  assert.strictEqual(store.all()[0].text, "buy milk");
});
