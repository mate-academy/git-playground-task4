const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "notes.json");

// Reads the store from `file`. A missing file means no notes yet; any other
// failure (corrupt JSON, permissions) is thrown so save() can't overwrite it.
function loadFrom(file) {
  let raw;
  try {
    raw = fs.readFileSync(file, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") return { nextId: 1, notes: [] };
    throw err;
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Cannot read ${file}: invalid JSON (${err.message}). Fix or delete the file.`);
  }
}

function load() {
  return loadFrom(FILE);
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
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

// Returns the notes whose text contains `term`.
function matches(notes, term) {
  return notes.filter((note) => note.text.includes(term));
}

function search(term) {
  return matches(load().notes, term);
}

// Sets the text of the note with `id`. Returns false if there is no such note.
function editNote(notes, id, text) {
  const note = notes.find((n) => n.id === id);
  if (!note) return false;
  note.text = text;
  return true;
}

function edit(id, text) {
  const data = load();
  if (!editNote(data.notes, id, text)) return false;
  save(data);
  return true;
}

module.exports = { all, add, remove, search, matches, edit, editNote, loadFrom };
