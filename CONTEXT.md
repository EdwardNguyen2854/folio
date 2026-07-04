# Context

Folio is a local-first Markdown resource library for builders who work with AI agents and text-driven tools.

## Ubiquitous Language

### Item (FolioItem)

The atomic unit of Folio. A Markdown document with structured metadata. An item has a single, permanent identity (id) and a lifecycle that moves through states. Every item is created once and updated in place — there is no versioning yet.

### Library

The collection of all items in Folio. Stored as a single JSON document in the browser (localStorage) and exported/imported as a portable `.json` file. A library is single-user and local-first.

### Type (FolioType)

The kind of resource the item is. Fixed taxonomy: `Instruction | Command | Template | Workflow | Note | Other`. Types are currently closed — users cannot add custom types.

### Lifecycle (FolioLifecycle)

The item's lifecycle state: `draft | active | archived`. Mutually exclusive — an item is in exactly one lifecycle state.

### Flags (FolioFlags)

Additive boolean signals on an item: `isFavorite`, `isProductionReady`. These are orthogonal to lifecycle — an active item can be both a favorite and production-ready.

### Rating

A set of numeric scores on a scale (1–5) across three dimensions: `overall`, `clarity`, `usefulness`. Rating dimensions are fixed. For qualitative assessment, use the `notes` field.

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

## Resolved Decisions

### FolioStatus split into lifecycle + flags (Issue #2)

The old `FolioStatus` enum (`Saved | Reading | Testing | Favorite | Archived | Production-ready`) conflated lifecycle, quality signals, and flags. Resolution: Split into `lifecycle: draft | active | archived` (mutually exclusive) and `flags: { isFavorite, isProductionReady }` (additive booleans). Implemented in Slices 1–4.

### Rating dimensions reduced (Issue #3)

The five fixed rating dimensions (`overall`, `clarity`, `usefulness`, `reusability`, `safety`) were arbitrary. Resolution: Reduced to `overall`, `clarity`, `usefulness` — the three most universally relevant dimensions. `notes` serves as the qualitative overflow. Implemented in the rating-dimension reduction pass.

### Version history is not yet implemented (Issue #1)

The local-first promise is incomplete without version history. A JSON restore gives point-in-time recovery only. Resolution: Version history is explicitly disclaimed. Power users are directed to use **Git** for history tracking — Folio items are Markdown files that integrate naturally with Git workflows. This may be revisited in a future release.

## Remaining Open Decisions

### Compare diff is block-level, not line-level

**Decision needed:** "Line-level diff" was listed in the VISION but is impractical for unstructured Markdown. The current implementation is block-level.

Resolution: Diff operates at the Markdown block level (paragraphs, code fences, list items), not individual lines.
