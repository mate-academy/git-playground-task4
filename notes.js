const store = require("./lib/store");
const config = require("./lib/config");

function main() {
  const [, , command, ...rest] = process.argv;

  switch (command) {
    case "add": {
      const text = rest.join(" ").trim();
      if (!text) {
        console.error("Usage: node notes.js add <text>");
        process.exitCode = 1;
        return;
      }
      const note = store.add(text);
      console.log(`Added #${note.id}: ${note.text}`);
      break;
    }
    case "list": {
      const notes = store.all();
      if (notes.length === 0) {
        console.log("No notes yet.");
        return;
      }
      for (const n of notes) {
        console.log(`#${n.id}  ${n.text}`);
      }
      break;
    }
    case "search": {
      const term = rest.join(" ").trim();
      if (!term) {
        console.error("Usage: node notes.js search <term>");
        process.exitCode = 1;
        return;
      }
      const found = store.search(term);
      if (found.length === 0) {
        console.log(`No notes matching "${term}".`);
        return;
      }
      for (const n of found) {
        console.log(`#${n.id}  ${n.text}`);
      }
      break;
    }
    case "edit": {
      const id = Number(rest[0]);
      const text = rest.slice(1).join(" ").trim();
      if (!id || !text) {
        console.error("Usage: node notes.js edit <id> <text>");
        process.exitCode = 1;
        return;
      }
      const ok = store.edit(id, text);
      console.log(ok ? `Updated note #${id}` : `No note #${id} found`);
      break;
    }
    case "delete": {
      const id = Number(rest[0]);
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
