# Runbook

## Prerequisites

- Git
- Node.js
- A modern browser

No package installation is required.

## Local Startup

From the repository root:

```powershell
node server.js
```

Open:

```text
http://localhost:8000
```

The root page redirects to:

```text
http://localhost:8000/taskcalendar.html
```

## Local Shutdown

Stop the terminal process running `server.js` with `Ctrl+C`.

If the server was started in the background, identify and stop the Node process that is serving the repo.

## Common Operations

### Add a Task

1. Select a date in the calendar.
2. Keep the sidebar on `Tasks`.
3. Enter a task title.
4. Optionally set time, priority, and details.
5. Click `Add task`.

### Add a Note

1. Select a date in the calendar.
2. Switch the sidebar to `Notes`.
3. Enter note content.
4. Click `Add note`.

### Navigate Months

- Click previous or next month controls.
- Swipe horizontally across the calendar grid.

### Reset Local Data

Planner data is stored in browser `localStorage` under:

```text
task-calendar-v2
```

To reset data, clear site data for `localhost:8000` in the browser, or run this in the browser console:

```javascript
localStorage.removeItem("task-calendar-v2");
location.reload();
```

## Troubleshooting

| Symptom | Likely Cause | Action |
| --- | --- | --- |
| Page does not load | Server not running | Run `node server.js`. |
| Port already in use | Another process is using port `8000` | Stop the other process or set `PORT` before starting the server. |
| Tasks disappear | Browser site data was cleared | Data is local-only and cannot be recovered from the app. |
| Styling looks different | Browser compatibility or cached file | Refresh the page and use a modern browser. |

## Configuration

The server uses port `8000` by default. Override it with:

```powershell
$env:PORT=8080
node server.js
```
