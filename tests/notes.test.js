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

// edit() works on the real notes.json, so back it up and restore it around the test.
test("edit updates an existing note and rejects an unknown id", () => {
  const fs = require("fs");
  const path = require("path");
  const file = path.join(__dirname, "..", "notes.json");
  const backup = fs.existsSync(file) ? fs.readFileSync(file) : null;
  try {
    fs.rmSync(file, { force: true });
    const store = require("../lib/store");
    const { id } = store.add("old");
    assert.strictEqual(store.edit(id, "new"), true);
    assert.strictEqual(store.all()[0].text, "new");
    assert.strictEqual(store.edit(999, "x"), false);
  } finally {
    if (backup) fs.writeFileSync(file, backup);
    else fs.rmSync(file, { force: true });
  }
});
