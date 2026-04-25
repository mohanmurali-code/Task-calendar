# Task-calendar

A static calendar planner built with HTML, CSS, and JavaScript.

It includes month navigation, swipe gestures, task management, notes, search, filters, and browser local storage.

## Documentation

This repo now includes enterprise-style documentation for traceability and maintenance:

- [Project overview](docs/PROJECT_OVERVIEW.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Requirements traceability matrix](docs/REQUIREMENTS_TRACEABILITY.md)
- [Runbook](docs/RUNBOOK.md)
- [Test plan](docs/TEST_PLAN.md)
- [Decision log](docs/DECISIONS.md)
- [Changelog](docs/CHANGELOG.md)
- [Maintenance guide](docs/MAINTENANCE.md)

## Run locally

Open `index.html` directly in a browser, or serve the folder locally:

```powershell
node server.js
```

Then visit:

```text
http://localhost:8000
```

## Files

- `index.html` redirects to the calendar page.
- `taskcalendar.html` contains the app UI, styling, planner logic, and local storage.
- `server.js` serves the static files locally with Node.
- `docs/` contains project documentation, traceability, runbook, and test plan.

## Traceability

Feature requirements are tracked in `docs/REQUIREMENTS_TRACEABILITY.md`. When app behavior changes, update the traceability matrix, test plan, changelog, and any affected architecture notes.
