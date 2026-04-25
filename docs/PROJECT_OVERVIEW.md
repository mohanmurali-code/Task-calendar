# Project Overview

## Purpose

Task Calendar is a browser-based calendar planner for day-level task and note management. It is designed as a lightweight static web app that can run locally without a build step, backend service, or package installation.

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

- `index.html`: Redirects users to the main calendar page.
- `taskcalendar.html`: Contains the complete app UI, styling, behavior, and local persistence logic.
- `server.js`: Serves the static files locally through Node.js.
