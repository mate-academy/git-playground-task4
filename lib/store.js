const fs = require("fs");
const path = require("path");

// NOTES_FILE lets tests point the store at a temp file.
function file() {
  return process.env.NOTES_FILE || path.join(__dirname, "..", "notes.json");
}

function load() {
  let raw;
  try {
    raw = fs.readFileSync(file(), "utf8");
  } catch (err) {
    if (err.code === "ENOENT") return { nextId: 1, notes: [] };
    throw err;
  }
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`${file()} is not valid JSON; fix or remove it before continuing`);
  }
}

// Write to a temp file and rename so a crash can't leave a truncated notes file.
function save(data) {
  const tmp = `${file()}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file());
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
  if (!note) return false;
  note.text = text;
  save(data);
  return true;
}

module.exports = { all, add, remove, search, matches, edit };
