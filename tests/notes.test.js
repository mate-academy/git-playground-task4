const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

const store = require("../lib/store");
const { matches } = store;

const notes = [
  { id: 1, text: "buy milk" },
  { id: 2, text: "call the bank" },
  { id: 3, text: "milk the almonds" },
];

const NOTES_FILE = path.join(__dirname, "..", "notes.json");
let backup = null;

test.before(() => {
  backup = fs.existsSync(NOTES_FILE) ? fs.readFileSync(NOTES_FILE, "utf8") : null;
  fs.writeFileSync(NOTES_FILE, JSON.stringify({ nextId: 1, notes: [] }));
});

test.after(() => {
  if (backup === null) fs.rmSync(NOTES_FILE, { force: true });
  else fs.writeFileSync(NOTES_FILE, backup);
});

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

test("edit updates the text of an existing note", () => {
  const note = store.add("original text");
  const ok = store.edit(note.id, "updated text");
  assert.strictEqual(ok, true);
  const updated = store.all().find((n) => n.id === note.id);
  assert.strictEqual(updated.text, "updated text");
});

test("edit returns false and does not throw for an id that does not exist", () => {
  const ok = store.edit(999999, "does not matter");
  assert.strictEqual(ok, false);
});
