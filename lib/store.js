const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "notes.json");

function load() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return { nextId: 1, notes: [] };
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
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) return false;

  const before = data.notes.length;
  data.notes = data.notes.filter((n) => n.id !== numericId);
  save(data);
  return data.notes.length < before;
}

// Returns the notes whose text contains `term` (Case-Insensitive Fix #4)
function matches(notes, term) {
  if (!term) return []; // Prevents empty search matching everything (Fix #3)
  const normalizedTerm = term.toLowerCase();
  return notes.filter((note) => note.text.toLowerCase().includes(normalizedTerm));
}

function search(term) {
  return matches(load().notes, term);
}

// Robust Edit function handling Type Coercion (Fix #1)
function edit(id, text) {
  const data = load();
  const numericId = parseInt(id, 10);
  
  // If the provided ID isn't a valid number, safely return false
  if (isNaN(numericId)) return false;

  const note = data.notes.find((n) => n.id === numericId);
  if (!note) return false;
  
  note.text = text;
  save(data);
  return true;
}

module.exports = { all, add, remove, search, matches, edit };