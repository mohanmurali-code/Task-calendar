# Project Overview

## Purpose

Task Calendar is a browser-based calendar planner for day-level task and note management. It is designed as a GitHub Pages deployable static app built with Vite and React.

## Current Scope

The application provides:

- Month calendar navigation.
- Swipe gestures for moving between months.
- Day selection.
- Task creation with title, optional time, priority, and details.
- Note creation per selected day.
- Task completion toggling.
- Task and note deletion.
- Clearing completed tasks for the selected day.
- Search within the selected day.
- Task filters for all, open, done, and high-priority tasks.
- Monthly summary counts.
- Local browser persistence through `localStorage`.
- Responsive layout with mobile dock controls.

## Out of Scope

The current implementation does not include:

- User authentication.
- Server-side storage.
- Multi-device sync.
- Calendar import/export.
- Reminders or notifications.
- Role-based access control.
- Audit logging outside browser storage.

## Primary Users

- Individual users managing personal tasks and notes.
- Developers extending a small static planning app.

## Repository Entry Points

- `index.html`: Vite entry point.
- `taskcalendar.html`: Compatibility redirect for older links.
- `src/App.jsx`: Main React planner application.
- `src/styles.css`: Application styling and responsive layout.
- `src/storage/`: Storage adapter layer.
- `server.js`: Legacy static server helper.
