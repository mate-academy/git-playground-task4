const test = require("node:test");
const assert = require("node:assert");

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

// Use a throwaway file so tests never touch a real notes.json.
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "notes-test-"));
process.env.NOTES_FILE = path.join(dir, "notes.json");
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
  assert.strictEqual(matches(notes, "MILK").length, 2);
});

test("add, edit, remove round-trip", () => {
  fs.rmSync(process.env.NOTES_FILE, { force: true });
  const a = store.add("first");
  const b = store.add("second");
  assert.deepStrictEqual([a.id, b.id], [1, 2]);

  assert.strictEqual(store.edit(1, "changed"), true);
  assert.strictEqual(store.all()[0].text, "changed");
  assert.strictEqual(store.edit(99, "nope"), false);

  assert.strictEqual(store.remove(1), true);
  assert.strictEqual(store.remove(1), false);
  assert.strictEqual(store.all().length, 1);
});

test("a corrupt store file throws instead of being overwritten", () => {
  fs.writeFileSync(process.env.NOTES_FILE, "{bad");
  assert.throws(() => store.all(), SyntaxError);
  assert.throws(() => store.add("x"), SyntaxError);
  assert.strictEqual(fs.readFileSync(process.env.NOTES_FILE, "utf8"), "{bad");
});
