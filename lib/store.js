const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "notes.json");

function load() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch (e) {
    // Only treat ENOENT (file not found) as OK
    if (e.code === 'ENOENT') {
      return { nextId: 1, notes: [] };
    }
    // Re-throw other errors (corruption, permissions, etc)
    throw e;
  }
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

function edit(id, text) {
  const data = load();
  const note = data.notes.find((n) => n.id === id);
  if (!note){
    return false;
  }
  note.text = text;
  save(data);
  return true;
}

module.exports = { all, add, remove, search, matches, edit };
