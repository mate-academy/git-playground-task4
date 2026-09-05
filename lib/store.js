const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "notes.json");
const LOCK_FILE = `${FILE}.lock`;
const LOCK_TIMEOUT_MS = 2000;
const LOCK_RETRY_MS = 10;

// Blocks the whole (single-threaded, synchronous) process until it holds
// FILE.lock, so two `notes` invocations can't interleave load()/save().
function withLock(fn) {
  const start = Date.now();
  let fd;
  while (fd === undefined) {
    try {
      fd = fs.openSync(LOCK_FILE, "wx");
    } catch (err) {
      if (err.code !== "EEXIST") throw err;
      if (Date.now() - start > LOCK_TIMEOUT_MS) {
        throw new Error("Timed out waiting for notes store lock");
      }
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, LOCK_RETRY_MS);
    }
  }
  try {
    fs.closeSync(fd);
    return fn();
  } finally {
    fs.unlinkSync(LOCK_FILE);
  }
}

function load() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") {
      return { nextId: 1, notes: [] };
    }
    throw new Error(`Notes store at ${FILE} is unreadable or corrupted: ${err.message}`);
  }
}

function save(data) {
  const tmpFile = `${FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2));
  fs.renameSync(tmpFile, FILE);
}

function all() {
  return load().notes;
}

function add(text) {
  return withLock(() => {
    const data = load();
    const note = { id: data.nextId, text };
    data.notes.push(note);
    data.nextId += 1;
    save(data);
    return note;
  });
}

function remove(id) {
  return withLock(() => {
    const data = load();
    const before = data.notes.length;
    data.notes = data.notes.filter((n) => n.id !== id);
    save(data);
    return data.notes.length < before;
  });
}

// Returns the notes whose text contains `term`.
function matches(notes, term) {
  return notes.filter((note) => note.text.includes(term));
}

function search(term) {
  return matches(load().notes, term);
}

module.exports = { all, add, remove, search, matches };
