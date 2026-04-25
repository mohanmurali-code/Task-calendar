# Maintenance Guide

## Development Workflow

1. Start the local server:

   ```powershell
   node server.js
   ```

2. Open:

   ```text
   http://localhost:8000/taskcalendar.html
   ```

3. Edit app code in `src/`.
4. Refresh the browser.
5. Run the checks in `docs/TEST_PLAN.md`.
6. Update documentation when features or behavior change.

## Documentation Update Rules

When adding a feature:

- Update `docs/REQUIREMENTS_TRACEABILITY.md`.
- Update `docs/TEST_PLAN.md`.
- Update `docs/CHANGELOG.md`.
- Update `docs/ARCHITECTURE.md` if state, storage, rendering, or major UI structure changes.
- Add a decision to `docs/DECISIONS.md` when a meaningful technical choice is made.

## Versioning Guidance

The project does not currently use formal releases. If releases are added later, use semantic versioning:

- Patch: Bug fixes and documentation-only changes.
- Minor: Backward-compatible features.
- Major: Storage model changes or breaking behavior changes.

## Local Storage Migration Guidance

The current storage key is:

```text
task-calendar-v2
```

If the item schema changes incompatibly:

1. Add a new storage key or migration function.
2. Document the migration in `docs/ARCHITECTURE.md`.
3. Add test cases to `docs/TEST_PLAN.md`.
4. Note the migration in `docs/CHANGELOG.md`.

## Code Organization Guidance

The app has been split into a Vite and React structure. Keep these responsibilities separated:

- `src/App.jsx` for application composition and feature behavior.
- `src/styles.css` for styling.
- `src/storage/` for persistence helpers.
- `src/utils/date.js` for date and calendar helpers.

If the app grows further, split large React sections into `src/components/`.

## GitHub Pages Development Guidance

Production behavior must remain static-host compatible:

- Do not depend on `server.js` for app features.
- Do not add server-only APIs to required user workflows.
- Keep browser storage as the baseline offline mode.
- Add GitHub sync as an optional adapter.
- Do not commit tokens, credentials, or user profile data unless intentionally using example data.
