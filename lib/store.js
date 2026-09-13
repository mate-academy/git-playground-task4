const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "notes.json");

function load() {
  let raw;
  try {
    raw = fs.readFileSync(FILE, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") {
      return { nextId: 1, notes: [] };
    }
    throw err;
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`${FILE} is corrupted and could not be parsed: ${err.message}`);
  }
}

function save(data) {
  // Write to a temp file and rename so a crash mid-write can't corrupt notes.json.
  const tmpFile = `${FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2));
  fs.renameSync(tmpFile, FILE);
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
  if (!text) {
    return false;
  }
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
