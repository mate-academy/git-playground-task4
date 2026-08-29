const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const store = require("../lib/store");
const { matches, edit } = store;

const NOTES_FILE = path.join(__dirname, "..", "notes.json");

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

// `edit` reads and writes notes.json, so snapshot the real file and put it back.
test("edit", async (t) => {
  const backup = fs.existsSync(NOTES_FILE)
    ? fs.readFileSync(NOTES_FILE, "utf8")
    : null;

  t.beforeEach(() => {
    fs.writeFileSync(
      NOTES_FILE,
      JSON.stringify({ nextId: 3, notes: [{ id: 1, text: "old text" }] }),
    );
  });

  t.after(() => {
    if (backup === null) fs.rmSync(NOTES_FILE, { force: true });
    else fs.writeFileSync(NOTES_FILE, backup);
  });

  await t.test("updates the note and reports success", () => {
    assert.strictEqual(edit(1, "new text"), true);
    const saved = JSON.parse(fs.readFileSync(NOTES_FILE, "utf8"));
    assert.strictEqual(saved.notes[0].text, "new text");
  });

  await t.test("returns false for an unknown id instead of throwing", () => {
    assert.strictEqual(edit(999, "whatever"), false);
  });
});
