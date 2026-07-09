# Unit 4 Git playground — Lesson 4

A tiny command-line notes tool, used as the practice repo for Unit 4, Lesson 4 (reviewing code). This repo has a branch called `review-me` with a small change on it — and a bug planted in that change on purpose. Your job is to have Claude review it and see whether it catches the bug.

### The app
- `node notes.js add <text>` — add a note
- `node notes.js list` — list all notes
- `node notes.js search <term>` — list notes containing a term
- `node notes.js delete <id>` — delete a note

Layout: `notes.js` is the entry point, `lib/store.js` loads, saves, and searches notes, `lib/config.js` holds settings, and `tests/` holds the test suite (`npm test`).

### Set up
1. Make sure you have your own copy of this repo (created from the lesson on the platform).
2. Clone it locally, and run `gh auth login` so Claude can open pull requests through the `gh` CLI.
3. Open Claude Code in the folder.

### Lesson 4 task — review a pull request
Goal: open the `review-me` pull request, have Claude review it, and judge whether it caught the planted bug.

1. **Check the branch is there.** Run `git branch -a` — you should see `review-me`. It came with your copy.
2. **Open the PR.** Ask Claude: *"Open a pull request for the `review-me` branch."*
3. **Have Claude review it.** Ask: *"Review this PR — look for bugs, edge cases, and anything risky."*
4. **Judge the review.** One bug was planted on purpose. Did Claude catch it? Note what it flagged and whether it found the real problem.
5. **Comment.** Add a one-line comment on the PR saying whether Claude caught the bug.
6. **Open** the pull request against the main repository, not your fork.
