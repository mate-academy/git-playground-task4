const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "notes.json");
const LOCK = FILE + ".lock";
const LOCK_TIMEOUT_MS = 5000;
const LOCK_STALE_MS = 10000;

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

// Serialises read-modify-write cycles across processes using an exclusive lock file.
function withLock(fn) {
  const start = Date.now();
  let fd;
  while (fd === undefined) {
    try {
      fd = fs.openSync(LOCK, "wx");
    } catch (err) {
      if (err.code !== "EEXIST") throw err;
      try {
        if (Date.now() - fs.statSync(LOCK).mtimeMs > LOCK_STALE_MS) {
          fs.unlinkSync(LOCK); // left behind by a crashed process
          continue;
        }
      } catch {
        continue; // lock vanished between checks; retry
      }
      if (Date.now() - start > LOCK_TIMEOUT_MS) {
        throw new Error("Could not acquire notes.json lock");
      }
      sleep(25);
    }
  }
  try {
    return fn();
  } finally {
    fs.closeSync(fd);
    try {
      fs.unlinkSync(LOCK);
    } catch {}
  }
}

function load() {
  let raw;
  try {
    raw = fs.readFileSync(FILE, "utf8");
  } catch (err) {
    // Only a missing file means "no notes yet"; anything else must not be masked.
    if (err.code === "ENOENT") return { nextId: 1, notes: [] };
    throw err;
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`notes.json is corrupt and was not modified: ${err.message}`);
  }
}

// Writes to a temp file then renames, so a crash never leaves a truncated notes.json.
function save(data) {
  const tmp = `${FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, FILE);
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

// Returns true if the note was updated, false if no note has that id.
function edit(id, text) {
  return withLock(() => {
    const data = load();
    const note = data.notes.find((n) => n.id === id);
    if (!note) return false;
    note.text = text;
    save(data);
    return true;
  });
}

module.exports = { all, add, remove, search, matches, edit };
