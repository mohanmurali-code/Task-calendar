# Decision Log

## ADR-001: Keep the App Static

Status: Accepted

The project remains a static HTML, CSS, and JavaScript application.

### Context

The repository started as a small static calendar. The requested features can be delivered without a build system or framework.

### Decision

Keep the application framework-free and avoid package installation.

### Consequences

- Simple local setup.
- Easy hosting on static platforms.
- Less tooling overhead.
- The main HTML file can become large as features grow.

## ADR-002: Use Browser Local Storage

Status: Accepted

### Context

The app needs task and note persistence without a backend.

### Decision

Store app records in `localStorage` with key `task-calendar-v2`.

### Consequences

- Data survives refreshes.
- Data is private to the local browser profile.
- Data does not sync across devices.
- Clearing site data removes all planner records.

## ADR-003: Use Pointer Events for Swipe Navigation

Status: Accepted

### Context

The calendar should support swipe gestures for next and previous month navigation.

### Decision

Use pointer events on the calendar grid and detect horizontal gestures above a threshold.

### Consequences

- Works across mouse, touch, and pen input.
- Keeps vertical scrolling available through CSS `touch-action: pan-y`.
- Swipe behavior is implemented without dependencies.

## ADR-004: Document as a Lightweight Enterprise App

Status: Accepted

### Context

The user requested documentation that makes the project traceable like an enterprise application.

### Decision

Add separate documents for overview, architecture, requirements traceability, runbook, testing, and decision history.

### Consequences

- Requirements can be mapped to implementation and verification steps.
- Future contributors have a clearer operating model.
- Documentation needs to be maintained with feature changes.

## ADR-005: Target GitHub Pages Static Deployment

Status: Accepted

### Context

The application should be deployable on GitHub Pages while continuing to grow into a more capable planner.

### Decision

Keep the primary application static and GitHub Pages compatible. Do not rely on `server.js` for production behavior. Treat `server.js` as a local development helper only.

### Consequences

- The app can be hosted from the repository without a backend.
- Any future persistence beyond browser storage must use browser-compatible mechanisms such as import/export or GitHub API calls.
- GitHub repository sync must not depend on hard-coded credentials.

## ADR-006: Use Storage Adapters for Persistence Complexity

Status: Accepted

### Context

The app may need local browser storage, local JSON profiles, import/export, and GitHub-backed data.

### Decision

Introduce a storage adapter interface before implementing GitHub sync.

### Consequences

- UI code can stay independent from storage details.
- The app can support multiple persistence modes.
- GitHub sync can be added without rewriting calendar and task logic.

## ADR-007: Use Vite and React

Status: Accepted

### Context

The application is growing beyond a small static HTML demo and needs cleaner organization while remaining deployable to GitHub Pages.

### Decision

Use Vite and React for the frontend, with a GitHub Pages build workflow that publishes `dist/`.

### Consequences

- The app gains a maintainable component structure.
- Local development uses `npm run dev`.
- GitHub Pages deployment requires `npm ci` and `npm run build`.
- The final hosted artifact remains static HTML, CSS, and JavaScript.
