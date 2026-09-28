const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

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

test("edit", async (t) => {
  const store = require("../lib/store");
  const notesFile = path.join(__dirname, "..", "notes.json");
  const original = fs.existsSync(notesFile) ? fs.readFileSync(notesFile, "utf8") : null;

  t.after(() => {
    if (original === null) {
      fs.rmSync(notesFile, { force: true });
    } else {
      fs.writeFileSync(notesFile, original);
    }
  });

  await t.test("updates the text of an existing note", () => {
    const note = store.add("original text");
    const ok = store.edit(note.id, "updated text");
    assert.strictEqual(ok, true);
    assert.strictEqual(store.all().find((n) => n.id === note.id).text, "updated text");
  });

  await t.test("returns false and leaves notes untouched for an unknown id", () => {
    const before = store.all();
    const ok = store.edit(-1, "does not exist");
    assert.strictEqual(ok, false);
    assert.deepStrictEqual(store.all(), before);
  });
});
