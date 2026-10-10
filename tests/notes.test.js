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

test("search is case-insensitive", () => {
  assert.strictEqual(matches(notes, "MILK").length, 2);
});

test("store add/edit/remove round trip", () => {
  const fs = require("node:fs");
  const os = require("node:os");
  const path = require("node:path");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "notes-"));
  process.env.NOTES_FILE = path.join(dir, "notes.json");
  delete require.cache[require.resolve("../lib/store")];
  const store = require("../lib/store");

  const n = store.add("hello");
  assert.strictEqual(store.edit(n.id, "world"), true);
  assert.strictEqual(store.all()[0].text, "world");
  assert.strictEqual(store.edit(999, "x"), false);
  assert.strictEqual(store.remove(n.id), true);
  assert.strictEqual(store.all().length, 0);

  fs.writeFileSync(process.env.NOTES_FILE, "{corrupt");
  assert.throws(() => store.all());
  delete process.env.NOTES_FILE;
});
