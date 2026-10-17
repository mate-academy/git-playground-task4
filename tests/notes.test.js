const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

const store = require("../lib/store");
const { matches } = store;

const FILE = path.join(__dirname, "..", "notes.json");

// Runs `fn` with notes.json seeded to `data`, then restores whatever was there
// before (including "no file at all").
function withNotesFile(data, fn) {
  const existed = fs.existsSync(FILE);
  const backup = existed ? fs.readFileSync(FILE) : null;
  fs.writeFileSync(FILE, JSON.stringify(data));
  try {
    fn();
  } finally {
    if (existed) {
      fs.writeFileSync(FILE, backup);
    } else {
      fs.rmSync(FILE, { force: true });
    }
  }
}

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

test("an empty search term matches nothing rather than everything", () => {
  assert.strictEqual(matches(notes, "").length, 0);
});

test("edit updates an existing note and reports success", () => {
  withNotesFile({ nextId: 2, notes: [{ id: 1, text: "old" }] }, () => {
    assert.strictEqual(store.edit(1, "new"), true);
    assert.strictEqual(store.all()[0].text, "new");
  });
});

test("edit returns false for a missing note instead of throwing", () => {
  withNotesFile({ nextId: 2, notes: [{ id: 1, text: "old" }] }, () => {
    assert.strictEqual(store.edit(999, "x"), false);
    assert.strictEqual(store.all()[0].text, "old");
  });
});
