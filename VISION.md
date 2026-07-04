# Vision

Folio is a local-first workspace for people who collect, refine, and reuse Markdown-based resources — instructions, commands, templates, workflow notes, and other text assets that get pasted, shared, and iterated on.

## The problem

Builders who work with AI agents and other text-driven tools accumulate large libraries of reusable Markdown files. Over time, they need to:

- Capture new resources quickly without losing context.
- Organize, tag, and rate what actually works.
- Compare variants side-by-side to find the best version.
- Refine favorites over time.
- Back up the work so it survives a browser reset or device change.

Most tools force a choice: lightweight but shallow (a notes app) or powerful but heavy (a database plus a repo). Folio aims at the middle — rich enough to organize and compare, simple enough to live in the browser with no setup.

## What Folio is

A single-page workspace where every item is a Markdown document with structured metadata around it.

- **Capture** items by typing, uploading a file, or importing from a remote Markdown URL.
- **Organize** items with tags, types, lifecycle status, and authorship.
- **Compare** items side-by-side, by rendered preview, by raw text, or by line-level diff.
- **Rate** items across multiple dimensions to capture what works and why.
- **Refine** items over time with notes, edits, and updated ratings.
- **Back up and restore** the full library as a single portable JSON file.

## Design principles

- **Local-first.** Data lives in the browser by default. No account, no server, no lock-in.
- **Markdown-native.** Items are Markdown first, with rich previews and raw views treated as equal citizens.
- **Portable.** The entire library is a single JSON document that round-trips cleanly.
- **Theme-aware.** Respects the user's system preference and supports light and dark modes.
- **Responsive and quiet.** Built for both quick capture on small screens and serious library work on larger ones.

## What Folio is not

- Not a document editor or writing surface — it is a library and comparison tool.
- Not a collaboration platform — it is a personal, single-user workspace by design.
- Not tied to any single ecosystem — items are plain Markdown, and the data format is open.

## Where it is headed

The current focus is the core loop: capture, organize, compare, rate, refine. Future directions include version history per item, collections, saved compare notes, deeper frontmatter and license handling, bulk folder import, browser-based capture helpers, and optional sync for users who want shared access without giving up local ownership.