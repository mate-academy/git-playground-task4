const test = require("node:test");
const assert = require("node:assert");

const { matches, add, edit, remove } = require("../lib/store");

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

test("edit updates the text of an existing note", () => {
  const note = add("original text");
  try {
    const ok = edit(note.id, "updated text");
    assert.strictEqual(ok, true);
  } finally {
    remove(note.id);
  }
});

test("edit returns false and does not throw for a non-existent id", () => {
  assert.doesNotThrow(() => {
    const ok = edit(999999, "irrelevant");
    assert.strictEqual(ok, false);
  });
});
