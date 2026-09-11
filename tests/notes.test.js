const test = require("node:test");
const assert = require("node:assert");

const { matches, setText } = require("../lib/store");

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

test("edit changes the text of the note with that id", () => {
  const list = [{ id: 1, text: "buy milk" }];
  assert.strictEqual(setText(list, 1, "buy oat milk"), true);
  assert.strictEqual(list[0].text, "buy oat milk");
});

test("edit reports a missing id instead of throwing", () => {
  const list = [{ id: 1, text: "buy milk" }];
  assert.strictEqual(setText(list, 42, "x"), false);
  assert.strictEqual(list[0].text, "buy milk");
});
