## Code Review Findings (`review-me` branch)

### 1. Planted Bug Found
- **`lib/store.js` (`edit` function):** `data.notes.find((n) => n.id === id)` returns `undefined` when given a non-existent note ID, and the code immediately executes `note.text = text` without checking if `note` exists—causing an unhandled `TypeError` crash. It also fails to return a boolean indicating whether a note was actually updated.
- **`notes.js` (`case "edit"`):** Always prints `Updated note #${id}` without checking whether `store.edit(id, text)` succeeded or whether the user passed a valid ID and non-empty text.

### 2. Fix Applied
- Updated `store.edit(id, text)` in `lib/store.js` to return `false` when no matching note is found and `true` after saving the updated text.
- Updated `case "edit"` in `notes.js` to validate `id` and `text` and print `No note #${id} found` when `store.edit` returns `false`.
