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

// store tests run against a temp file via NOTES_FILE
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const store = require("../lib/store");

function withTempStore(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "notes-"));
  process.env.NOTES_FILE = path.join(dir, "notes.json");
  try {
    fn(process.env.NOTES_FILE);
  } finally {
    delete process.env.NOTES_FILE;
    fs.rmSync(dir, { recursive: true });
  }
}

test("search returns the matching notes, not just the count", () => {
  assert.deepStrictEqual(matches(notes, "milk").map((n) => n.id), [1, 3]);
});

test("edit updates an existing note", () => {
  withTempStore(() => {
    const { id } = store.add("old");
    assert.strictEqual(store.edit(id, "new"), true);
    assert.strictEqual(store.all()[0].text, "new");
  });
});

test("edit returns false for a missing note", () => {
  withTempStore(() => {
    assert.strictEqual(store.edit(99, "x"), false);
  });
});

test("remove returns false for a missing note", () => {
  withTempStore(() => {
    store.add("keep");
    assert.strictEqual(store.remove(99), false);
    assert.strictEqual(store.all().length, 1);
  });
});

test("a corrupted notes file is not overwritten", () => {
  withTempStore((f) => {
    fs.writeFileSync(f, "{not json");
    assert.throws(() => store.add("x"), /not valid JSON/);
    assert.strictEqual(fs.readFileSync(f, "utf8"), "{not json");
  });
});
