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

test("edit returns false and changes nothing for an unknown id", () => {
  const fs = require("node:fs");
  const path = require("node:path");
  const file = path.join(__dirname, "..", "notes.json");
  const backup = fs.existsSync(file) ? fs.readFileSync(file) : null;
  try {
    fs.writeFileSync(file, JSON.stringify({ nextId: 2, notes: [{ id: 1, text: "a" }] }));
    const { edit, all } = require("../lib/store");
    assert.strictEqual(edit(99, "x"), false);
    assert.strictEqual(edit(1, "b"), true);
    assert.strictEqual(all()[0].text, "b");
  } finally {
    if (backup) fs.writeFileSync(file, backup);
    else fs.rmSync(file, { force: true });
  }
});
