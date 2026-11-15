## Add `edit` command

Adds `notes edit <id> <text>` (`store.edit` and a new case in `notes.js`) and resolves the merge conflict with `main` in `lib/store.js` by keeping `edit` in the exports.

**Did Claude catch the planted bug?** Yes. Claude's review flagged that `edit` in `lib/store.js` crashes with a `TypeError` when no note has the given id, because the result of `find` is used without checking it. It also noticed that `notes.js` always prints "Updated note #N" even when nothing was updated, that `edit` accepts empty text, and that `edit` has no tests.
