const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const { matches, edit, all } = require("../lib/store");

const NOTES_CLI = path.join(__dirname, "..", "notes.js");

const notes = [
  { id: 1, text: "buy milk" },
  { id: 2, text: "call the bank" },
  { id: 3, text: "milk the almonds" },
];

const NOTES_FILE = path.join(__dirname, "..", "notes.json");

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

function withNotesFile(data, fn) {
  const existed = fs.existsSync(NOTES_FILE);
  const backup = existed ? fs.readFileSync(NOTES_FILE, "utf8") : null;
  fs.writeFileSync(NOTES_FILE, JSON.stringify(data, null, 2));
  try {
    fn();
  } finally {
    if (existed) {
      fs.writeFileSync(NOTES_FILE, backup);
    } else {
      fs.unlinkSync(NOTES_FILE);
    }
  }
}

test("edit updates the text of an existing note", () => {
  withNotesFile({ nextId: 4, notes: [{ id: 1, text: "buy milk" }] }, () => {
    const ok = edit(1, "buy oat milk");
    assert.strictEqual(ok, true);
    assert.strictEqual(all()[0].text, "buy oat milk");
  });
});

test("edit returns false for an invalid id", () => {
  withNotesFile({ nextId: 4, notes: [{ id: 1, text: "buy milk" }] }, () => {
    const ok = edit(999, "does not exist");
    assert.strictEqual(ok, false);
    assert.strictEqual(all()[0].text, "buy milk");
  });
});

test("CLI edit rejects empty text and leaves the note untouched", () => {
  withNotesFile({ nextId: 4, notes: [{ id: 1, text: "buy milk" }] }, () => {
    const output = execFileSync("node", [NOTES_CLI, "edit", "1", "  "], {
      encoding: "utf8",
    });
    assert.match(output, /Provide text to edit/);
    assert.strictEqual(all()[0].text, "buy milk");
  });
});
