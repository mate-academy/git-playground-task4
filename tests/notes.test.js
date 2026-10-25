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

test("edit updates an existing note and returns false for an unknown id", () => {
  const os = require("node:os");
  const fs = require("node:fs");
  const path = require("node:path");
  process.env.NOTES_FILE = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "notes-")), "notes.json");
  const store = require("../lib/store");
  const note = store.add("old");
  assert.strictEqual(store.edit(note.id, "new"), true);
  assert.strictEqual(store.all()[0].text, "new");
  assert.strictEqual(store.edit(999, "x"), false);
});
