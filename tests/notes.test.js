const test = require("node:test");
const assert = require("node:assert");

const { matches, diffNotes } = require("../lib/store");

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

test("diffNotes reports words added and removed between two notes", () => {
  const result = diffNotes(notes[0], notes[2]);
  assert.deepStrictEqual(result.added, ["the", "almonds"]);
  assert.deepStrictEqual(result.removed, ["buy"]);
});

test("diffNotes reports no differences for identical notes", () => {
  const result = diffNotes(notes[0], notes[0]);
  assert.deepStrictEqual(result.added, []);
  assert.deepStrictEqual(result.removed, []);
});
