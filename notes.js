#!/usr/bin/env node
const store = require("./lib/store");

const [command, ...rest] = process.argv.slice(2);

// Returns a positive integer id, or null if the argument isn't one.
function parseId(arg) {
  const id = Number(arg);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function main() {
  switch (command) {
    case "add": {
      const text = rest.join(" ").trim();
      if (!text) {
        console.log("Usage: notes add <your note>");
        return;
      }
      const note = store.add(text);
      console.log(`Added note #${note.id}: ${note.text}`);
      break;
    }
    case "list": {
      const notes = store.all();
      if (notes.length === 0) {
        console.log("No notes yet. Add one with: notes add <text>");
        return;
      }
      for (const note of notes) {
        console.log(`#${note.id}  ${note.text}`);
      }
      break;
    }
    case "search": {
      const term = rest.join(" ").trim();
      if (!term) {
        console.log("Usage: notes search <term>");
        return;
      }
      const found = store.search(term);
      if (found.length === 0) {
        console.log(`No notes match "${term}"`);
        return;
      }
      for (const note of found) {
        console.log(`#${note.id}  ${note.text}`);
      }
      break;
    }
    case "edit": {
      const id = parseId(rest[0]);
      if (id === null) {
        console.log("Usage: notes edit <id> <new text>");
        return;
      }
      const text = rest.slice(1).join(" ").trim();
      if (!text) {
        console.log("Usage: notes edit <id> <new text>");
        return;
      }
      const ok = store.edit(id, text);
      console.log(ok ? `Updated note #${id}` : `No note #${id} found`);
      break;
    }
    case "delete": {
      const id = parseId(rest[0]);
      if (id === null) {
        console.log("Usage: notes delete <id>");
        return;
      }
      const ok = store.remove(id);
      console.log(ok ? `Deleted note #${id}` : `No note #${id} found`);
      break;
    }
    default:
      console.log("Commands: add <text> | list | search <term> | edit <id> <text> | delete <id>");
  }
}

try {
  main();
} catch (err) {
  console.error(err.message);
  process.exitCode = 1;
}
