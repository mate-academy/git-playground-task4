# Review notes

Asked Claude to review this PR. It caught the planted bug: `edit` on a note id that does not exist crashes, because `store.edit()` never checks that `find()` found a note.
