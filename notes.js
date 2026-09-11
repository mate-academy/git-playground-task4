#!/usr/bin/env node
const store = require("./lib/store");
const config = require("./lib/config");

const [command, ...rest] = process.argv.slice(2);

// Parses an id argument like "3". Returns null for anything else, like "abc" or "0x2".
function parseId(arg) {
  return /^\d+$/.test(arg) ? Number(arg) : null;
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
      const id = parseId(rest[0]);
      const text = rest.slice(1).join(" ").trim();
      if (id === null || !text) {
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
      console.log(`(Session locks after ${config.SESSION_TIMEOUT_MINUTES} minutes of inactivity.)`);
  }
}

main();
