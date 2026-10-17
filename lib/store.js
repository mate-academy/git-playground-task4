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

// Compares two notes' text, returning the words each has that the other lacks.
function diffNotes(noteA, noteB) {
  const wordsA = noteA.text.split(/\s+/).filter(Boolean);
  const wordsB = noteB.text.split(/\s+/).filter(Boolean);
  const setA = new Set(wordsA);
  const setB = new Set(wordsB);

  return {
    added: wordsB.filter((w) => !setA.has(w)),
    removed: wordsA.filter((w) => !setB.has(w)),
  };
}

function diff(idA, idB) {
  const notes = load().notes;
  const noteA = notes.find((n) => n.id === idA);
  const noteB = notes.find((n) => n.id === idB);
  if (!noteA || !noteB) {
    return null;
  }
  return diffNotes(noteA, noteB);
}

module.exports = { all, add, remove, search, matches, diff, diffNotes };
