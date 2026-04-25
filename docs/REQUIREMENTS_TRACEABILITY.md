# Requirements Traceability Matrix

This document maps requested capabilities to implementation locations and verification steps.

| ID | Requirement | Status | Implementation | Verification |
| --- | --- | --- | --- | --- |
| REQ-001 | Run the app locally from the repository. | Complete | `server.js`, `README.md` | Run `node server.js`, visit `http://localhost:8000`. |
| REQ-002 | Open the app through `index.html`. | Complete | `index.html` | Visit `/` and confirm redirect to `taskcalendar.html`. |
| REQ-003 | Navigate months with buttons. | Complete | `taskcalendar.html`: previous, today, next controls | Click previous, today, and next controls. |
| REQ-004 | Navigate months with swipe gestures. | Complete | `taskcalendar.html`: pointer gesture handlers on calendar grid | Swipe left and right on the calendar. |
| REQ-005 | Provide Instagram-inspired styling. | Complete | `taskcalendar.html`: CSS layout, cards, gradients, dock, avatar mark | Visual inspection on desktop and mobile widths. |
| REQ-006 | Select a calendar day. | Complete | `taskcalendar.html`: `selectDate()` and day buttons | Click days and confirm sidebar updates. |
| REQ-007 | Create tasks for a selected day. | Complete | `taskcalendar.html`: task composer and `addItem()` | Add a task and confirm it appears in the feed and calendar count. |
| REQ-008 | Include task title, time, priority, and details. | Complete | `taskcalendar.html`: task fields and item model | Add task with all fields and inspect rendered card. |
| REQ-009 | Mark tasks as done. | Complete | `taskcalendar.html`: `toggleDone()` | Click task completion circle. |
| REQ-010 | Delete tasks. | Complete | `taskcalendar.html`: `deleteItem()` | Click task delete button. |
| REQ-011 | Clear completed tasks. | Complete | `taskcalendar.html`: `clearDone()` | Complete tasks, click clear done. |
| REQ-012 | Create notes for a selected day. | Complete | `taskcalendar.html`: notes mode and `addItem()` | Switch to Notes, add note, confirm feed and count. |
| REQ-013 | Delete notes. | Complete | `taskcalendar.html`: `deleteItem()` | Delete a note from the feed. |
| REQ-014 | Search selected-day items. | Complete | `taskcalendar.html`: search input and `renderFeed()` | Type search text and confirm filtered results. |
| REQ-015 | Filter tasks by status and priority. | Complete | `taskcalendar.html`: filter select and task filtering | Select open, done, and high filters. |
| REQ-016 | Show monthly task, done, and note stats. | Complete | `taskcalendar.html`: `renderStats()` | Add items across month and confirm stats. |
| REQ-017 | Persist data across refreshes. | Complete | `taskcalendar.html`: `localStorage` key `task-calendar-v2` | Add item, refresh page, confirm item remains. |
| REQ-018 | Support responsive mobile layout. | Complete | `taskcalendar.html`: CSS media queries and mobile dock | Resize viewport or test on mobile width. |
| REQ-019 | Document the application for traceability. | Complete | `docs/` folder and `README.md` | Review documentation index and traceability matrix. |
| REQ-020 | Keep the app deployable on GitHub Pages. | In progress | `vite.config.js`, `.github/workflows/pages.yml`, `docs/HLD_GITHUB_PAGES.md`, `docs/LLD_GITHUB_PAGES.md` | Run `npm run build` and verify Pages workflow uploads `dist/`. |
| REQ-021 | Support multiple planner profiles. | Planned | Storage adapter design in `docs/LLD_GITHUB_PAGES.md` | Create, switch, export, and import profiles. |
| REQ-022 | Support JSON import and export. | Planned | Import/export adapter design in `docs/LLD_GITHUB_PAGES.md` | Export profile JSON, import it into a clean browser profile. |
| REQ-023 | Optionally sync profile JSON to GitHub. | Planned | GitHub adapter design in `docs/LLD_GITHUB_PAGES.md` | Pull and push profile JSON through GitHub API with conflict detection. |
| REQ-024 | Avoid hard-coded GitHub secrets. | Planned | Security model in `docs/HLD_GITHUB_PAGES.md` | Inspect source and verify no token is committed. |
| REQ-025 | Migrate to Vite and React. | Complete | `package.json`, `vite.config.js`, `src/` | Run `npm run build`. |
| REQ-026 | Introduce storage adapter boundary. | Complete | `src/storage/` | Verify app persistence goes through `storage` adapter import. |

## Traceability Notes

- The app is intentionally client-only, so persistence is local to a browser profile.
- Current verification is manual plus simple static checks.
- Future releases should add automated UI tests when the app grows beyond static HTML.
