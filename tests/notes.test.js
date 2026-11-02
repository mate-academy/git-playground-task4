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

test("edit returns false for an unknown id", () => {
  const fs = require("fs");
  const os = require("os");
  const path = require("path");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "notes-"));
  const file = path.join(dir, "notes.json");
  fs.writeFileSync(file, JSON.stringify({ nextId: 2, notes: [{ id: 1, text: "a" }] }));
  const modPath = require.resolve("../lib/store");
  delete require.cache[modPath];
  const orig = path.join;
  path.join = (...a) => (a[a.length - 1] === "notes.json" ? file : orig(...a));
  const store = require("../lib/store");
  path.join = orig;
  assert.strictEqual(store.edit(99, "x"), false);
  assert.strictEqual(store.edit(1, "b"), true);
  assert.strictEqual(store.all()[0].text, "b");
  delete require.cache[modPath];
});
