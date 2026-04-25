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
