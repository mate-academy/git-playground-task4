const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

const { matches, add, edit, all } = require("../lib/store");

const FILE = path.join(__dirname, "..", "notes.json");

// The store reads and writes a fixed file, so snapshot it around the tests
// that mutate it and put it back afterwards.
function withCleanStore(fn) {
  const had = fs.existsSync(FILE);
  const backup = had ? fs.readFileSync(FILE, "utf8") : null;
  fs.writeFileSync(FILE, JSON.stringify({ nextId: 1, notes: [] }));
  try {
    fn();
  } finally {
    if (had) fs.writeFileSync(FILE, backup);
    else fs.unlinkSync(FILE);
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

test("edit updates an existing note and reports success", () => {
  withCleanStore(() => {
    const note = add("buy milk");
    assert.strictEqual(edit(note.id, "buy oat milk"), true);
    assert.strictEqual(all()[0].text, "buy oat milk");
  });
});

test("edit reports failure for an id that does not exist", () => {
  withCleanStore(() => {
    add("buy milk");
    assert.strictEqual(edit(99, "whatever"), false);
  });
});

test("edit reports failure for a non-numeric id instead of throwing", () => {
  withCleanStore(() => {
    add("buy milk");
    assert.strictEqual(edit(Number("abc"), "whatever"), false);
  });
});

test("edit leaves the store untouched when the id is not found", () => {
  withCleanStore(() => {
    add("buy milk");
    edit(99, "whatever");
    assert.deepStrictEqual(all().map((n) => n.text), ["buy milk"]);
  });
});
