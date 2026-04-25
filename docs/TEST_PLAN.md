# Test Plan

## Test Strategy

The current app is a static browser application. Testing is currently manual with lightweight static validation.

Recommended test types:

- Static smoke check: confirm the HTML and inline JavaScript parse.
- Local server check: confirm the app returns HTTP 200.
- Manual functional testing: confirm user workflows in the browser.
- Responsive testing: confirm desktop and mobile layouts.

## Current Automated Checks

### Server Response

```powershell
npm run build
```

Expected result:

```text
dist build completes successfully
```

### Inline Script Parse

```powershell
npm run dev
```

Expected result:

```text
Vite starts and serves the React app.
```

## Manual Functional Test Cases

| ID | Scenario | Steps | Expected Result |
| --- | --- | --- | --- |
| TC-001 | Load app | Open the Vite dev URL | App renders calendar and sidebar. |
| TC-002 | Navigate with buttons | Click previous and next controls | Month title and day grid change. |
| TC-003 | Navigate with swipe | Swipe left and right on calendar | Visible month changes. |
| TC-004 | Select day | Click any day cell | Sidebar title and selected day label update. |
| TC-005 | Add task | Select day, add task title, click `Add task` | Task appears in feed and day count. |
| TC-006 | Add task metadata | Add task with time, priority, details | Card displays metadata and details. |
| TC-007 | Complete task | Click task completion circle | Task changes to done state. |
| TC-008 | Clear completed | Complete a task, click `Clear done` | Completed task is removed. |
| TC-009 | Delete task | Click task delete button | Task is removed. |
| TC-010 | Add note | Switch to Notes, add note | Note appears in feed and day count. |
| TC-011 | Delete note | Click note delete button | Note is removed. |
| TC-012 | Search | Add multiple items, search text | Feed filters to matching items. |
| TC-013 | Filter tasks | Select open, done, high filters | Feed matches selected filter. |
| TC-014 | Persistence | Add item, refresh browser | Item remains visible. |
| TC-015 | Mobile layout | Resize below 640px | Calendar remains usable and bottom dock appears. |

## Regression Areas

Retest these areas after every UI or state change:

- Date key formatting.
- Month navigation across year boundaries.
- Task and note persistence.
- Search and filter combinations.
- Swipe gesture handling.
- Mobile calendar cell readability.

## Future Automation

If the app continues growing, add:

- Playwright UI tests.
- JavaScript unit tests for date and filtering logic.
- Accessibility checks.
- Visual regression screenshots for desktop and mobile.
