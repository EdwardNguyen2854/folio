# Folio

Folio is a local-first web app for saving, organizing, comparing, rating, and refining reusable Markdown resources.

It is designed for files like `SKILL.md`, reusable instructions, commands, templates, workflow notes, and other Markdown-based AI resources, without locking the product name to any single asset type.

## Features in v0.1.0

- Local-first library stored in browser `localStorage`
- Add items manually
- Upload `.md` / `.markdown` files
- Import from GitHub file URL or raw Markdown URL
- Markdown preview, raw view, metadata view, and review notes
- Tags, type, status, author, license, source URL, and ratings
- Table and card library views
- Full-text search and filtering
- Side-by-side compare
- Rendered preview compare
- Raw Markdown compare
- Line-level diff compare
- JSON export/import backup
- System, light, and dark theme modes
- Responsive professional UI

## Tech stack

- React
- TypeScript
- Vite
- Plain CSS, no UI framework
- Browser localStorage for persistence

## Getting started

```bash
npm install
npm run dev
```

Then open the local URL shown by Vite.

## Build

```bash
npm run build
npm run preview
```

## Data storage

Folio stores data locally in the browser using this key:

```text
folio.items.v1
```

Use **Settings → Export JSON** to back up your library.

## Importing from GitHub

You can paste either:

```text
https://github.com/owner/repo/blob/main/path/to/file.md
```

or:

```text
https://raw.githubusercontent.com/owner/repo/main/path/to/file.md
```

Folio converts standard GitHub file URLs into raw URLs automatically.

## Suggested next features

- Version history per item
- Collections
- Saved compare notes
- Better frontmatter parsing
- License detection
- GitHub repo folder import
- Browser extension / bookmarklet
- Optional desktop app with local files
- Test cases and evaluation scoring
- Cloud sync and collaboration

## Project structure

```text
folio/
├── src/
│   ├── components/
│   ├── lib/
│   ├── styles/
│   ├── App.tsx
│   ├── main.tsx
│   └── types.ts
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```
