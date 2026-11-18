const fs = require("fs");
const path = require("path");

const DEFAULT_FILE = path.join(__dirname, "..", "notes.json");

// NOTES_FILE overrides the data location (used by tests). Read on each call.
function filePath() {
  return process.env.NOTES_FILE || DEFAULT_FILE;
}

function load() {
  let raw;
  try {
    raw = fs.readFileSync(filePath(), "utf8");
  } catch (err) {
    // Only a missing file means "no notes yet"; anything else must not
    // be treated as empty, or the next save would wipe the real data.
    if (err.code === "ENOENT") return { nextId: 1, notes: [] };
    throw err;
  }
  const data = JSON.parse(raw);
  if (!data || !Array.isArray(data.notes) || !Number.isInteger(data.nextId)) {
    throw new Error(`${filePath()} is malformed; fix or remove it.`);
  }
  return data;
}

// Write to a temp file and rename so a crash mid-write can't corrupt the data.
function save(data) {
  const file = filePath();
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file);
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
  const removed = data.notes.length < before;
  if (removed) save(data);
  return removed;
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
