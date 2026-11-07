const test = require("node:test");
const assert = require("node:assert");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const root = path.join(__dirname, "..");

// Runs the CLI from a temporary copy so tests never touch the real notes.json.
function setup(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "notes-test-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.cpSync(path.join(root, "lib"), path.join(dir, "lib"), { recursive: true });
  fs.copyFileSync(path.join(root, "notes.js"), path.join(dir, "notes.js"));
  return (...args) =>
    execFileSync(process.execPath, ["notes.js", ...args], {
      cwd: dir,
      encoding: "utf8",
    }).trim();
}

test("edit replaces the text of an existing note", (t) => {
  const notes = setup(t);
  notes("add", "buy milk");
  assert.strictEqual(notes("edit", "1", "buy", "oat", "milk"), "Updated note #1");
  assert.strictEqual(notes("list"), "#1  buy oat milk");
});

test("edit reports an unknown id instead of crashing", (t) => {
  const notes = setup(t);
  notes("add", "buy milk");
  assert.strictEqual(notes("edit", "99", "hello"), "No note #99 found");
  assert.strictEqual(notes("list"), "#1  buy milk");
});

test("edit shows usage for a non-numeric id", (t) => {
  const notes = setup(t);
  notes("add", "buy milk");
  assert.match(notes("edit", "abc", "hello"), /^Usage:/);
  assert.strictEqual(notes("list"), "#1  buy milk");
});

test("edit with no arguments shows usage", (t) => {
  const notes = setup(t);
  assert.match(notes("edit"), /^Usage:/);
});

for (const [name, args] of [
  ["missing", ["1"]],
  ["blank", ["1", "   "]],
]) {
  test(`edit keeps the note when the text is ${name}`, (t) => {
    const notes = setup(t);
    notes("add", "buy milk");
    assert.match(notes("edit", ...args), /^Usage:/);
    assert.strictEqual(notes("list"), "#1  buy milk");
  });
}
