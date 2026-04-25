# Task-calendar

A GitHub Pages deployable calendar planner built with Vite, React, CSS, and JavaScript.

It includes month navigation, swipe gestures, task management, notes, search, filters, and browser local storage through a storage adapter.

## Documentation

This repo now includes enterprise-style documentation for traceability and maintenance:

- [Project overview](docs/PROJECT_OVERVIEW.md)
- [Architecture](docs/ARCHITECTURE.md)
- [High-level design for GitHub Pages](docs/HLD_GITHUB_PAGES.md)
- [Low-level design for GitHub Pages](docs/LLD_GITHUB_PAGES.md)
- [Requirements traceability matrix](docs/REQUIREMENTS_TRACEABILITY.md)
- [Runbook](docs/RUNBOOK.md)
- [Test plan](docs/TEST_PLAN.md)
- [Decision log](docs/DECISIONS.md)
- [Changelog](docs/CHANGELOG.md)
- [Maintenance guide](docs/MAINTENANCE.md)

## Run locally

Install dependencies:

```powershell
npm install
```

Start the Vite dev server:

```powershell
npm run dev
```

Then visit the URL printed by Vite, usually:

```text
http://127.0.0.1:5173/Task-calendar/
```

Build for GitHub Pages:

```powershell
npm run build
```

## Files

- `index.html` is the Vite application entry point.
- `taskcalendar.html` redirects older links to the app root.
- `src/` contains the React app, styles, utilities, and storage adapter.
- `server.js` is retained as a lightweight legacy static server helper.
- `vite.config.js` configures the GitHub Pages base path.
- `.github/workflows/pages.yml` builds and deploys the `dist/` folder to GitHub Pages.
- `docs/` contains project documentation, traceability, runbook, and test plan.

## Traceability

Feature requirements are tracked in `docs/REQUIREMENTS_TRACEABILITY.md`. When app behavior changes, update the traceability matrix, test plan, changelog, and any affected architecture notes.

## GitHub Pages Direction

The app should remain deployable as a static GitHub Pages site. Future persistence should use a storage adapter model so the app can support local browser storage, JSON import/export, and optional GitHub repository sync without requiring a backend.
