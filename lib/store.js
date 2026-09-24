const fs = require("fs");
const path = require("path");

// NOTES_FILE overrides the default location (useful for tests and installed use).
function file() {
  return process.env.NOTES_FILE || path.join(__dirname, "..", "notes.json");
}

function load() {
  try {
    return JSON.parse(fs.readFileSync(file(), "utf8"));
  } catch (err) {
    // Only a missing file means "no notes yet"; anything else must not be
    // papered over, or the next save would overwrite the user's data.
    if (err.code === "ENOENT") return { nextId: 1, notes: [] };
    throw err;
  }
}

// Write to a temp file then rename, so a crash mid-write can't corrupt the store.
function save(data) {
  const target = file();
  const tmp = `${target}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, target);
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
  if (data.notes.length === before) return false;
  save(data);
  return true;
}

// Returns the notes whose text contains `term` (case-insensitive).
// An empty term matches nothing.
function matches(notes, term) {
  if (!term) return [];
  const needle = term.toLowerCase();
  return notes.filter((note) => note.text.toLowerCase().includes(needle));
}

function search(term) {
  return matches(load().notes, term);
}

// Returns true if the note was updated, false if no note has that id.
function edit(id, text) {
  const data = load();
  const note = data.notes.find((n) => n.id === id);
  if (!note) return false;
  note.text = text;
  save(data);
  return true;
}

module.exports = { all, add, remove, search, matches, edit };
