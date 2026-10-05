const test = require("node:test");
const assert = require("node:assert");

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { matches, editNote, loadFrom } = require("../lib/store");

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

test("editNote updates the text of an existing note", () => {
  const list = [{ id: 1, text: "a" }];
  assert.strictEqual(editNote(list, 1, "b"), true);
  assert.strictEqual(list[0].text, "b");
});

test("editNote returns false and changes nothing for a missing id", () => {
  const list = [{ id: 1, text: "a" }];
  assert.strictEqual(editNote(list, 999, "b"), false);
  assert.strictEqual(editNote(list, NaN, "b"), false);
  assert.strictEqual(list[0].text, "a");
});

test("loadFrom returns an empty store when the file does not exist", () => {
  const file = path.join(os.tmpdir(), `notes-missing-${process.pid}.json`);
  assert.deepStrictEqual(loadFrom(file), { nextId: 1, notes: [] });
});

test("loadFrom throws on corrupt JSON instead of returning an empty store", () => {
  const file = path.join(os.tmpdir(), `notes-corrupt-${process.pid}.json`);
  fs.writeFileSync(file, "{ not json");
  try {
    assert.throws(() => loadFrom(file), /invalid JSON/);
  } finally {
    fs.rmSync(file, { force: true });
  }
});
