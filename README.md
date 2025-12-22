# GID — Get It Done

GID is a local-first app to capture and organize notes, tasks and small dashboards.

Key features
- Pages and blocks (text, heading, database, kanban, code, mindmap)
- Sidebar for navigation and templates
- Local persistence with optional Google Drive sync

Technologies
- Frontend: React 19 + TypeScript
- Build & dev: Vite
- Styling: Tailwind CSS (loaded via CDN in `index.html`)
- Storage: IndexedDB via `utils/storage.ts` (migrated from localStorage/sql.js)
- Optional libs included via `index.html`: `sql.js`, `pyodide` (for advanced features)

Important notes
- The AI assistant component (`GeminiAssistant`) has been removed — the app is now strictly local-first. To re-enable Gemini/GenAI, add the dependency and use a dynamic, gated import.

Running locally
1. Install dependencies:

```bash
npm install
```

2. Start the dev server (recommended):

```bash
npm start
# or
npm run dev
```

3. Open the app in your browser: http://localhost:5173/ (default Vite dev port) or check the terminal for the exact local URL.

Project structure (selected files)
- `App.tsx` — main entry and app layout
- `components/` — UI components (`Sidebar`, `Editor`, `BlockItem`, etc.)
- `utils/` — helpers (`drive.ts`, `storage.ts`, `templates.ts`, `idb.ts`)
- `index.html` — import map, CDN scripts and PWA meta

Contributing
- Open an issue or PR for features, bug fixes, or to reintroduce AI integrations.

Troubleshooting & notes
- Service worker behavior: during development the service worker may cache files and require manual unregistering in your browser when making SW changes. For full offline testing build and serve the production build (see below).
- IndexedDB: data is stored locally in IndexedDB (`utils/storage.ts`) and supports migrations. Backups can be exported via `getDBBlob`.

Build & test production (recommended for PWA validation)

1. Create a production build:

```bash
npm run build
```

2. Serve the built site as a static site (we add `serve`):

```bash
npm run serve
```

3. Open the served URL and test install/offline behavior (install prompt, offline fallback).

Notes:
- The app uses a service worker (via `vite-plugin-pwa`) and stores all user data in IndexedDB (`utils/storage.ts`).
- Manifest and icons are configured in `manifest.webmanifest` — update icons if you want custom artwork.
- If an update is available, the app displays a small banner letting users update to the latest version.

Files of interest
- `App.tsx` — main layout and app entry
- `components/` — UI components (`Sidebar`, `Editor`, `BlockItem`, etc.)
- `utils/storage.ts` — IndexedDB storage and CRUD helpers
- `utils/idb.ts` — IndexedDB helper and migration support
- `service-worker.js` — offline caching logic
- `manifest.webmanifest` — PWA configuration

Contact / Contributing
- Open an issue or PR for features, bug fixes, or to reintroduce AI integrations.

