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

test("search is case-insensitive", () => {
  assert.strictEqual(matches(notes, "MILK").length, 2);
});

test("empty search term matches nothing", () => {
  assert.strictEqual(matches(notes, "").length, 0);
});

// Store tests run against a throwaway file via NOTES_FILE.
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
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test("add assigns increasing ids and list returns them", () =>
  withTempStore(() => {
    assert.strictEqual(store.add("a").id, 1);
    assert.strictEqual(store.add("b").id, 2);
    assert.strictEqual(store.all().length, 2);
  }));

test("remove returns false for an unknown id", () =>
  withTempStore(() => {
    store.add("a");
    assert.strictEqual(store.remove(99), false);
    assert.strictEqual(store.remove(1), true);
    assert.strictEqual(store.all().length, 0);
  }));

test("edit updates an existing note and returns false for a missing one", () =>
  withTempStore(() => {
    store.add("old");
    assert.strictEqual(store.edit(1, "new"), true);
    assert.strictEqual(store.all()[0].text, "new");
    assert.strictEqual(store.edit(42, "x"), false);
  }));

test("corrupt store file throws instead of being silently reset", () =>
  withTempStore((file) => {
    fs.writeFileSync(file, "{not json");
    assert.throws(() => store.add("x"));
    assert.strictEqual(fs.readFileSync(file, "utf8"), "{not json");
  }));
