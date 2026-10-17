const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "notes.json");

function load() {
  let raw;
  try {
    raw = fs.readFileSync(FILE, "utf8");
  } catch (err) {
    // No file yet is fine — start empty. Any other read error (permissions,
    // too many open files) must propagate so we never overwrite real data.
    if (err.code === "ENOENT") {
      return { nextId: 1, notes: [] };
    }
    throw err;
  }
  // A corrupt file also propagates rather than being silently reset to empty.
  return JSON.parse(raw);
}

function save(data) {
  // Write to a temp file then rename, so an interrupted write can't leave
  // notes.json truncated.
  const tmp = `${FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, FILE);
}

function all() {
  return load().notes;
}

function add(text) {
  const data = load();
  const note = { id: data.nextId, text };
  data.notes.push(note);
  data.nextId += 1;
  save(data);
  return note;
}

function remove(id) {
  const data = load();
  const before = data.notes.length;
  data.notes = data.notes.filter((n) => n.id !== id);
  save(data);
  return data.notes.length < before;
}

// Returns the notes whose text contains `term`. An empty term matches nothing.
function matches(notes, term) {
  if (!term) {
    return [];
  }
  return notes.filter((note) => note.text.includes(term));
}

function search(term) {
  return matches(load().notes, term);
}

// Updates the note with the given id. Returns true if a note was updated,
// false if no note has that id.
function edit(id, text) {
  const data = load();
  const note = data.notes.find((n) => n.id === id);
  if (!note) {
    return false;
  }
  note.text = text;
  save(data);
  return true;
}

module.exports = { all, add, remove, search, matches, edit };
