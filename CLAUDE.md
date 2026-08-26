# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A tiny command-line notes tool used as the practice repo for Unit 4, Lesson 4 (reviewing code). The repo ships with a `review-me` branch that contains a small change with a bug planted on purpose, for practicing PR review.

## Commands

- Run the CLI: `node notes.js <command>` — commands are `add <text>`, `list`, `search <term>`, `delete <id>`
- Run all tests: `npm test` (runs `node --test`, Node's built-in test runner)
- Run a single test file: `node --test tests/notes.test.js`
- No lint or build step is configured.

CI (`.github/workflows/ci.yml`) runs `npm test` on Node 22 for every pull request.

## Architecture

- `notes.js` — CLI entry point; parses `process.argv` and dispatches to `lib/store.js`.
- `lib/store.js` — all data logic: loads/saves notes as JSON to `notes.json` in the repo root, and implements `add`, `remove`, `all`, `search`. `search` delegates to the pure, separately-exported `matches(notes, term)` function, which is what `tests/notes.test.js` exercises directly (rather than going through the file-backed `search`).
- `lib/config.js` — static settings (e.g. `SESSION_TIMEOUT_MINUTES`), not currently read anywhere except the CLI's help text in `notes.js`.
- State is a single flat JSON file (`notes.json`, gitignored), not a database — `load()`/`save()` in `lib/store.js` are the only place that touches it.

## Lesson task context

The `review-me` branch and its bug are intentional for this exercise (see README.md for the full lesson steps: open a PR for `review-me`, review it, judge whether the planted bug was caught, comment and resolve). Don't "fix" the planted bug preemptively outside of that review flow unless asked.
