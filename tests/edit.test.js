const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const store = require("../lib/store");
const CLI = path.join(__dirname, "..", "notes.js");

// Give each test its own notes file via NOTES_FILE.
function withTempFile(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "notes-test-"));
  const file = path.join(dir, "notes.json");
  const prev = process.env.NOTES_FILE;
  process.env.NOTES_FILE = file;
  try {
    fn(file);
  } finally {
    if (prev === undefined) delete process.env.NOTES_FILE;
    else process.env.NOTES_FILE = prev;
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function cli(file, ...args) {
  const r = spawnSync("node", [CLI, ...args], {
    env: { ...process.env, NOTES_FILE: file },
    encoding: "utf8",
  });
  return { out: r.stdout.trim(), err: r.stderr, status: r.status };
}

test("edit updates the text of an existing note", () => {
  withTempFile(() => {
    const a = store.add("buy milk");
    store.add("call bank");
    assert.strictEqual(store.edit(a.id, "buy oat milk"), true);
    assert.deepStrictEqual(store.all().map((n) => n.text), ["buy oat milk", "call bank"]);
  });
});

test("edit returns false and changes nothing for an unknown id", () => {
  withTempFile(() => {
    store.add("buy milk");
    assert.strictEqual(store.edit(99, "x"), false);
    assert.strictEqual(store.all()[0].text, "buy milk");
  });
});

test("remove does not write the file when nothing was deleted", () => {
  withTempFile((file) => {
    assert.strictEqual(store.remove(1), false);
    assert.strictEqual(fs.existsSync(file), false);
  });
});

test("load refuses a corrupt file and leaves it untouched", () => {
  withTempFile((file) => {
    fs.writeFileSync(file, "{");
    assert.throws(() => store.add("x"));
    assert.strictEqual(fs.readFileSync(file, "utf8"), "{");
  });
});

test("load rejects valid JSON with the wrong shape", () => {
  withTempFile((file) => {
    fs.writeFileSync(file, "{}");
    assert.throws(() => store.all(), /malformed/);
  });
});

test("save leaves no temp files behind", () => {
  withTempFile((file) => {
    store.add("a");
    assert.deepStrictEqual(fs.readdirSync(path.dirname(file)), ["notes.json"]);
  });
});

test("CLI edit: success, unknown id, bad id, missing text", () => {
  withTempFile((file) => {
    cli(file, "add", "hello");
    assert.strictEqual(cli(file, "edit", "1", "bye").out, "Updated note #1");
    assert.strictEqual(cli(file, "list").out, "#1  bye");
    assert.strictEqual(cli(file, "edit", "9", "x").out, "No note #9 found");
    for (const args of [["edit", "abc", "x"], ["edit", "1"], ["edit"]]) {
      const r = cli(file, ...args);
      assert.match(r.out, /Usage: notes edit/);
      assert.strictEqual(r.status, 0);
    }
    assert.strictEqual(cli(file, "list").out, "#1  bye");
  });
});
