# Changelog

## Unreleased

### Added

- Instagram-inspired planner UI with rounded cards, gradient accents, avatar mark, and responsive mobile dock.
- Month navigation by buttons and swipe gestures.
- Day selection.
- Task management with title, time, priority, details, completion, deletion, and clear completed actions.
- Notes for selected days.
- Search and task filters.
- Monthly counts for tasks, completed tasks, and notes.
- Local browser persistence with `localStorage`.
- Local Node static server.
- Enterprise-style documentation set.
- High-level and low-level GitHub Pages design documents.
- Vite and React application structure.
- Storage adapter boundary for browser persistence.
- GitHub Pages workflow that builds and publishes `dist/`.

### Changed

- Replaced the original compact glass calendar implementation with a larger planner interface.
- Updated README to describe the expanded application and documentation.
- Replaced the single-file planner runtime with a React application under `src/`.

### Notes

- Data remains local to the browser profile.
- No backend or package installation has been introduced.
