# Runbook

## Prerequisites

- Git
- Node.js 22 or newer
- A modern browser

## Install Dependencies

```powershell
npm install
```

## Local Startup

From the repository root:

```powershell
npm run dev
```

Open the Vite URL, usually:

```text
http://127.0.0.1:5173/Task-calendar/
```

## Production Build

```powershell
npm run build
```

## Local Shutdown

Stop the terminal process running Vite with `Ctrl+C`.

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
| Page does not load | Vite server not running | Run `npm run dev`. |
| Port already in use | Another process is using the Vite port | Stop the other process or use the alternate URL printed by Vite. |
| Tasks disappear | Browser site data was cleared | Data is local-only and cannot be recovered from the app. |
| Styling looks different | Browser compatibility or cached file | Refresh the page and use a modern browser. |

## Configuration

Vite chooses port `5173` by default and prints the active URL at startup.

```powershell
$env:PORT=8080
node server.js
```
