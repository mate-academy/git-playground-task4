#!/usr/bin/env node
const store = require("./lib/store");
const config = require("./lib/config");

const [command, ...rest] = process.argv.slice(2);

// Parses the id argument for edit/delete. Prints `usage` and returns null
// if it's missing or not a positive integer, so callers never hand a NaN
// id down to the store.
function parseId(raw, usage) {
  if (raw === undefined) {
    console.log(usage);
    return null;
  }
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    console.log(`Invalid id "${raw}". ${usage}`);
    return null;
  }
  return id;
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
      const id = parseId(rest[0], "Usage: notes edit <id> <new text>");
      if (id === null) {
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
      const id = parseId(rest[0], "Usage: notes delete <id>");
      if (id === null) {
        return;
      }
      const ok = store.remove(id);
      console.log(ok ? `Deleted note #${id}` : `No note #${id} found`);
      break;
    }
    default:
      console.log("Commands: add <text> | list | search <term> | edit <id> <text> | delete <id>");
      console.log(`(Session locks after ${config.SESSION_TIMEOUT_MINUTES} minutes of inactivity.)`);
  }
}

main();
