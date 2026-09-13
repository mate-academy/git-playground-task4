const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const store = require("../lib/store");
const { matches } = store;

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

test("search is case-insensitive", () => {
  const result = matches(notes, "MILK");
  assert.strictEqual(result.length, 2);
});

// add/edit/remove persist to notes.json on disk, so back it up and restore
// it around every test to avoid clobbering real data or leaking state
// between tests.
const NOTES_FILE = path.join(__dirname, "..", "notes.json");
let backup;

test.beforeEach(() => {
  backup = fs.existsSync(NOTES_FILE) ? fs.readFileSync(NOTES_FILE, "utf8") : null;
  fs.writeFileSync(NOTES_FILE, JSON.stringify({ nextId: 1, notes: [] }, null, 2));
});

test.afterEach(() => {
  if (backup === null) {
    fs.rmSync(NOTES_FILE, { force: true });
  } else {
    fs.writeFileSync(NOTES_FILE, backup);
  }
});

test("add stores a note and assigns it an id", () => {
  const note = store.add("buy milk");
  assert.strictEqual(note.text, "buy milk");
  assert.strictEqual(store.all().length, 1);
});

test("edit updates the text of an existing note", () => {
  const note = store.add("buy milk");
  const ok = store.edit(note.id, "buy oat milk");
  assert.strictEqual(ok, true);
  assert.strictEqual(store.all()[0].text, "buy oat milk");
});

test("edit returns false for a nonexistent id instead of throwing", () => {
  assert.strictEqual(store.edit(999, "new text"), false);
});

test("edit returns false for a non-numeric id instead of throwing", () => {
  assert.strictEqual(store.edit(NaN, "new text"), false);
});

test("remove deletes an existing note and reports success", () => {
  const note = store.add("buy milk");
  assert.strictEqual(store.remove(note.id), true);
  assert.strictEqual(store.all().length, 0);
});

test("remove returns false for a nonexistent id", () => {
  assert.strictEqual(store.remove(999), false);
});
