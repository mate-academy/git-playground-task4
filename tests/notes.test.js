const test = require("node:test");
const assert = require("node:assert");

const fs = require("node:fs");
const path = require("node:path");

const store = require("../lib/store");
const { matches } = store;

// store reads and writes notes.json next to the package, so keep whatever
// is there safe while the edit tests run.
const NOTES_FILE = path.join(__dirname, "..", "notes.json");
let saved;
test.beforeEach(() => {
  saved = fs.existsSync(NOTES_FILE) ? fs.readFileSync(NOTES_FILE) : null;
  fs.rmSync(NOTES_FILE, { force: true });
});
test.afterEach(() => {
  if (saved === null) fs.rmSync(NOTES_FILE, { force: true });
  else fs.writeFileSync(NOTES_FILE, saved);
});

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

test("edit replaces the text of an existing note", () => {
  const note = store.add("buy milk");
  assert.strictEqual(store.edit(note.id, "buy oat milk"), true);
  assert.strictEqual(store.all()[0].text, "buy oat milk");
});

test("edit returns false and changes nothing when the id is unknown", () => {
  store.add("buy milk");
  assert.strictEqual(store.edit(99, "nope"), false);
  assert.strictEqual(store.edit(NaN, "nope"), false);
  assert.strictEqual(store.all()[0].text, "buy milk");
});
