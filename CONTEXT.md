# Context

Folio is a local-first Markdown resource library for builders who work with AI agents and text-driven tools.

## Ubiquitous Language

### Item (FolioItem)

The atomic unit of Folio. A Markdown document with structured metadata. An item has a single, permanent identity (id) and a lifecycle that moves through states. Every item is created once and updated in place — there is no versioning yet.

### Library

The collection of all items in Folio. Stored as a single JSON document in the browser (localStorage) and exported/imported as a portable `.json` file. A library is single-user and local-first.

### Type (FolioType)

The kind of resource the item is. Fixed taxonomy: `Instruction | Command | Template | Workflow | Note | Other`. Types are currently closed — users cannot add custom types.

### Status (FolioStatus)

The item's lifecycle and quality state. Currently a flat enum: `Saved | Reading | Testing | Favorite | Archived | Production-ready`. **This enum conflates lifecycle, quality signals, and flags — see Issue #2.**

### Rating

A set of numeric scores on a scale (presumably 1–5) across five dimensions: `overall`, `clarity`, `usefulness`, `reusability`, `safety`. Rating dimensions are fixed and cannot be customized.

### Tags

A free-form list of string tags applied to an item. Tags are additive and untyped. No tag hierarchy or controlled vocabulary.

### Compare

A view mode that displays two items simultaneously. Supports three display modes: `raw` (plain text), `preview` (rendered Markdown), and `diff` (block-level diff). Line-level diff is aspirational — not yet defined for unstructured Markdown.

### Refine

The act of updating an item's content, metadata, rating, or notes over time. Folio supports editing item content directly. The "not a document editor" constraint in VISION refers to general-purpose writing surfaces — it does not prohibit editing item content.

### Backup / Restore

Exporting the full library as a single JSON file and re-importing it. This is a point-in-time snapshot. There is no version history — see Issue #1.

### Workflows View

An unfinished view mode (`ViewMode.workflows`) referenced in the code but not yet implemented. Its purpose is not yet defined.

## Key Decisions

### FolioStatus is an orthogonal mess

**Decision needed:** FolioStatus currently mixes lifecycle (`Archived`), quality signals (`Favorite`, `Production-ready`), and engagement states (`Reading`, `Testing`). These are additive concepts that cannot coexist in a flat enum.

Proposed resolution: Split into two fields — `lifecycle: draft | active | archived` and `flags: Favorite | Production-ready` (flags are additive booleans).

### Rating dimensions are too rigid

**Decision needed:** The five fixed dimensions (`clarity`, `usefulness`, `reusability`, `safety`, `overall`) are arbitrary. Users with narrow libraries may find some dimensions irrelevant.

Proposed resolution: Either allow custom rating dimensions or reduce to a minimal set with a qualitative notes pressure valve.

### Compare diff is block-level, not line-level

**Decision needed:** "Line-level diff" was listed in the VISION but is impractical for unstructured Markdown. The current implementation is block-level.

Resolution: Diff operates at the Markdown block level (paragraphs, code fences, list items), not individual lines.

### Version history is not yet implemented

**Decision needed:** The local-first promise is incomplete without version history. A JSON restore gives point-in-time recovery only.

Resolution: Either implement per-item version snapshots or explicitly disclaim version history and direct power users to Git for history tracking.
