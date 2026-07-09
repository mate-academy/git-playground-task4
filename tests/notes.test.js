const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

const { matches, edit, search } = require("../lib/store");

// Path to the test file so we can mock/restore it safely
const FILE = path.join(__dirname, "..", "notes.json");
let backupData = null;

// Helper to back up real data before tests run
test.before(() => {
  if (fs.existsSync(FILE)) {
    backupData = fs.readFileSync(FILE, "utf8");
  }
});

// Helper to restore real data after tests finish
test.after(() => {
  if (backupData !== null) {
    fs.writeFileSync(FILE, backupData);
  } else if (fs.existsSync(FILE)) {
    fs.unlinkSync(FILE);
  }
});

// Setup a clean state before every single test
test.beforeEach(() => {
  const testData = {
    nextId: 4,
    notes: [
      { id: 1, text: "buy milk" },
      { id: 2, text: "call the bank" },
      { id: 3, text: "milk the almonds" },
    ]
  };
  fs.writeFileSync(FILE, JSON.stringify(testData, null, 2));
});

const mockNotes = [
  { id: 1, text: "buy milk" },
  { id: 2, text: "call the bank" },
  { id: 3, text: "milk the almonds" },
];

/* ------------------ Pure Matcher Tests ------------------ */

test("search finds every note that contains the term", () => {
  const result = matches(mockNotes, "milk");
  assert.strictEqual(result.length, 2);
});

test("search finds a single containing note", () => {
  const result = matches(mockNotes, "bank");
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].id, 2);
});

test("search returns nothing when no note contains the term", () => {
  const result = matches(mockNotes, "xyz");
  assert.strictEqual(result.length, 0);
});

// Fixes Bug #4 (Case-Insensitive Search)
test("search matches case-insensitively", () => {
  const result = matches(mockNotes, "MILK");
  assert.strictEqual(result.length, 2);
});

// Fixes Bug #3 (Empty term handling)
test("search with empty term returns an empty array", () => {
  const result = matches(mockNotes, "");
  assert.strictEqual(result.length, 0);
});

/* --------------------- Edit Tests --------------------- */

// Fixes Bug #1 (Guard clause against crash)
test("edit returns false for a missing numeric id instead of throwing", () => {
  assert.strictEqual(edit(999999, "whatever"), false);
});

test("edit returns false for a missing string id/NaN instead of throwing", () => {
  assert.strictEqual(edit("abc", "whatever"), false);
});

test("edit successfully updates an existing note and saves it", () => {
  const updateSuccess = edit(1, "buy oat milk instead");
  assert.strictEqual(updateSuccess, true);

  // Read back from the file to confirm it saved
  const updatedData = JSON.parse(fs.readFileSync(FILE, "utf8"));
  const updatedNote = updatedData.notes.find(n => n.id === 1);
  assert.strictEqual(updatedNote.text, "buy oat milk instead");
});