import { useState, useMemo } from "react";
import { formatDateKey } from "../utils/date.js";

const PRIORITY_ORDER = { high: 0, normal: 1, low: 2 };

export default function TasksPage({ items, tags, onToggleDone, onDelete, onConvert, onUpdateItem, onStartPomodoro }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [groupBy, setGroupBy] = useState("date");
  const [selected, setSelected] = useState(new Set());
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const tasks = useMemo(() => {
    let result = items.filter((i) => i.type === "task");
    const q = search.trim().toLowerCase();
    if (q) result = result.filter((i) => `${i.title} ${i.text}`.toLowerCase().includes(q));
    if (statusFilter === "open") result = result.filter((i) => !i.done);
    if (statusFilter === "done") result = result.filter((i) => i.done);
    if (priorityFilter !== "all") result = result.filter((i) => i.priority === priorityFilter);
    if (tagFilter !== "all") result = result.filter((i) => (i.tags || []).includes(tagFilter));
    return result;
  }, [items, search, statusFilter, priorityFilter, tagFilter]);

  const grouped = useMemo(() => {
    const map = new Map();
    const sorted = [...tasks].sort((a, b) => {
      if (groupBy === "date") return a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || "");
      if (groupBy === "priority") return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (groupBy === "status") return Number(a.done) - Number(b.done);
      return 0;
    });
    for (const task of sorted) {
      let key = "";
      if (groupBy === "date") key = formatDateKey(task.date, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
      else if (groupBy === "priority") key = task.priority.charAt(0).toUpperCase() + task.priority.slice(1) + " Priority";
      else if (groupBy === "status") key = task.done ? "Completed" : "Open";
      else if (groupBy === "tag") key = (task.tags || []).length ? (tags.find((t) => t.id === task.tags[0])?.label || "Untagged") : "Untagged";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(task);
    }
    return map;
  }, [tasks, groupBy, tags]);

  function toggleSelect(id) {
    setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }

  function bulkDone() { selected.forEach((id) => { const t = items.find((i) => i.id === id); if (t && !t.done) onToggleDone(id); }); setSelected(new Set()); }
  function bulkDelete() { selected.forEach((id) => onDelete(id)); setSelected(new Set()); }

  function startEdit(task) { setEditingId(task.id); setEditTitle(task.title); }
  function saveEdit(id) { if (editTitle.trim()) onUpdateItem(id, { title: editTitle.trim() }); setEditingId(null); }

  return (
    <div className="page tasks-page">
      <div className="page-header">
        <h2 className="page-title">📋 All Tasks</h2>
        <div className="page-stats">
          <span className="stat-chip">{tasks.filter((t) => !t.done).length} open</span>
          <span className="stat-chip done-chip">{tasks.filter((t) => t.done).length} done</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input className="field page-search" type="search" placeholder="Search tasks…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="done">Done</option>
        </select>
        <select className="select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="all">All Priority</option>
          <option value="high">🔴 High</option>
          <option value="normal">Normal</option>
          <option value="low">🔵 Low</option>
        </select>
        <select className="select" value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
          <option value="all">All Tags</option>
          {tags.map((t) => <option key={t.id} value={t.id}># {t.label}</option>)}
        </select>
        <select className="select" value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
          <option value="date">Group: Date</option>
          <option value="priority">Group: Priority</option>
          <option value="status">Group: Status</option>
          <option value="tag">Group: Tag</option>
        </select>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="bulk-bar">
          <span>{selected.size} selected</span>
          <button className="pill-btn" type="button" onClick={bulkDone}>✓ Mark done</button>
          <button className="pill-btn danger-btn" type="button" onClick={bulkDelete}>🗑 Delete</button>
          <button className="pill-btn" type="button" onClick={() => setSelected(new Set())}>Cancel</button>
        </div>
      )}

      {/* Task groups */}
      <div className="task-groups">
        {grouped.size === 0 && <div className="empty-state">No tasks found.</div>}
        {[...grouped.entries()].map(([group, groupTasks]) => (
          <div key={group} className="task-group">
            <div className="group-label">{group} <span className="muted">({groupTasks.length})</span></div>
            {groupTasks.map((task) => (
              <div key={task.id} className={`task-row priority-${task.priority} ${task.done ? "task-done" : ""} ${selected.has(task.id) ? "task-selected" : ""}`}>
                <input type="checkbox" checked={selected.has(task.id)} onChange={() => toggleSelect(task.id)} className="task-checkbox" />
                <div className="priority-bar" />
                <button className={`check ${task.done ? "done" : ""}`} type="button" onClick={() => onToggleDone(task.id)} />
                <div className="task-row-body" style={{ flex: 1, minWidth: 0 }}>
                  {editingId === task.id ? (
                    <input
                      className="field"
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => saveEdit(task.id)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit(task.id)}
                      style={{ padding: "4px 8px", minHeight: 0 }}
                    />
                  ) : (
                    <div className={`item-title ${task.done ? "done" : ""}`} onDoubleClick={() => startEdit(task)}>{task.title}</div>
                  )}
                  <div className="meta">
                    {task.time && <span className="chip">⏰ {task.time}</span>}
                    <span className="chip">{task.date}</span>
                    {(task.tags || []).map((tid) => {
                      const tag = tags.find((t) => t.id === tid);
                      return tag ? <span key={tid} className="chip tag-chip" style={{ color: tag.color, borderColor: tag.color + "55" }}># {tag.label}</span> : null;
                    })}
                    {task.pomodoroCount > 0 && <span className="chip pomo-badge">🍅×{task.pomodoroCount}</span>}
                  </div>
                </div>
                <div className="task-row-actions">
                  <button className="icon-action-btn" title="Start Pomodoro" type="button" onClick={() => onStartPomodoro(task)}>🍅</button>
                  <button className="icon-action-btn" title="Convert to Note" type="button" onClick={() => onConvert(task.id)}>↔</button>
                  <button className="icon-action-btn danger" title="Delete" type="button" onClick={() => onDelete(task.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
