import { useMemo, useState } from "react";
import EntityLinksPicker from "../components/EntityLinksPicker.jsx";
import LinkedChips from "../components/LinkedChips.jsx";
import { fromDateKey, toDateKey } from "../utils/date.js";
import { createDraftDefaults, normalizeLinks, PRIORITY_OPTIONS, STATUS_OPTIONS } from "../utils/entities.js";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function createRoutineId() {
  return `routine-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function emptyRoutineDraft() {
  return createDraftDefaults({ type: "routine", time: "", startTime: "", daysOfWeek: [] });
}

export default function RoutinesPage({ routines, onRoutinesChange, items, onPersistItems, tags }) {
  const todayKey = toDateKey(new Date());
  const todayDow = new Date().getDay();

  const [draft, setDraft] = useState(emptyRoutineDraft);
  const [editId, setEditId] = useState(null);

  const todayRoutines = useMemo(() => routines.filter((routine) => (routine.daysOfWeek || []).includes(todayDow)), [routines, todayDow]);

  function update(field, value) {
    setDraft((previous) => ({ ...previous, [field]: value }));
  }

  function toggleDay(day) {
    update("daysOfWeek", draft.daysOfWeek.includes(day) ? draft.daysOfWeek.filter((value) => value !== day) : [...draft.daysOfWeek, day]);
  }

  function saveRoutine() {
    if (!draft.title.trim() || draft.daysOfWeek.length === 0) return;

    const done = draft.status === "completed";
    const payload = {
      ...draft,
      type: "routine",
      title: draft.title.trim(),
      description: (draft.description || draft.text || "").trim(),
      text: (draft.description || draft.text || "").trim(),
      time: draft.startTime || draft.time || "",
      startTime: draft.startTime || draft.time || "",
      priority: draft.priority || "normal",
      status: draft.status || "open",
      completionTime: done ? (draft.completionTime || new Date().toISOString()) : "",
      done,
      links: normalizeLinks(draft.links),
      updatedAt: Date.now(),
    };

    if (editId) {
      onRoutinesChange(routines.map((routine) => routine.id === editId ? { ...routine, ...payload } : routine));
      setEditId(null);
    } else {
      onRoutinesChange([...routines, { id: createRoutineId(), createdAt: Date.now(), ...payload }]);
    }

    setDraft(emptyRoutineDraft());
  }

  function startEdit(routine) {
    setEditId(routine.id);
    setDraft({
      ...emptyRoutineDraft(),
      ...routine,
      description: routine.description || routine.text || "",
      startTime: routine.startTime || routine.time || "",
      daysOfWeek: routine.daysOfWeek || [],
      tags: routine.tags || [],
      links: routine.links || [],
    });
  }

  function cancelEdit() {
    setEditId(null);
    setDraft(emptyRoutineDraft());
  }

  function deleteRoutine(id) {
    onRoutinesChange(routines.filter((routine) => routine.id !== id));
  }

  function checkRoutineToday(routine) {
    const already = items.find((item) => item.type === "task" && item.date === todayKey && item.routineId === routine.id);
    if (already) return;

    const newTask = {
      id: `item-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      date: todayKey,
      type: "task",
      title: routine.title,
      description: routine.description || "",
      text: routine.description || "",
      time: routine.startTime || routine.time || "",
      priority: routine.priority || "normal",
      status: "open",
      dueDate: routine.dueDate || todayKey,
      reminderTime: routine.reminderTime || "",
      startDate: todayKey,
      startTime: routine.startTime || routine.time || "",
      durationMinutes: routine.durationMinutes || "",
      completionTime: "",
      parentId: routine.parentId || "",
      links: routine.links || [],
      tags: routine.tags || [],
      done: false,
      isPinned: false,
      isRoutine: true,
      routineId: routine.id,
      pomodoroCount: 0,
      timeTracking: { totalSeconds: 0, lastStartedAt: null },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    onPersistItems([...items, newTask]);
  }

  function isCheckedToday(routine) {
    return items.some((item) => item.type === "task" && item.date === todayKey && item.routineId === routine.id);
  }

  return (
    <div className="page routines-page">
      <div className="page-header">
        <h2 className="page-title">Routines</h2>
        <div className="page-stats">
          <span className="stat-chip">{routines.length} routines</span>
          <span className="stat-chip">{todayRoutines.length} today</span>
        </div>
      </div>

      {todayRoutines.length > 0 && (
        <div className="routine-today-section">
          <h3 className="section-title">Today's routines</h3>
          {todayRoutines.map((routine) => {
            const checked = isCheckedToday(routine);
            return (
              <div key={routine.id} className={`routine-today-card ${checked ? "checked" : ""}`}>
                <button className={`check ${checked ? "done" : ""}`} type="button" onClick={() => checkRoutineToday(routine)} />
                <div>
                  <div className="item-title" style={checked ? { textDecoration: "line-through", color: "var(--muted)" } : {}}>{routine.title}</div>
                  {(routine.startTime || routine.time) && <span className="muted" style={{ fontSize: 12 }}>Start {routine.startTime || routine.time}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="routine-list">
        <h3 className="section-title">All routines</h3>
        {routines.length === 0 && <div className="empty-state">No routines yet. Add one below.</div>}
        {routines.map((routine) => (
          <div key={routine.id} className="routine-card-row">
            <div style={{ flex: 1 }}>
              <div className="item-title">{routine.title}</div>
              {(routine.description || routine.text) && <p className="muted note-text" style={{ fontSize: 13, marginTop: 4 }}>{routine.description || routine.text}</p>}
              <div className="meta">
                {(routine.startTime || routine.time) && <span className="chip">Start: {routine.startTime || routine.time}</span>}
                <span className={`chip priority-chip ${routine.priority}`}>{routine.priority || "normal"}</span>
                {routine.status && <span className="chip">Status: {routine.status}</span>}
                {routine.dueDate && <span className="chip">Due: {routine.dueDate}</span>}
                {routine.reminderTime && <span className="chip">Reminder: {routine.reminderTime}</span>}
                {routine.durationMinutes && <span className="chip">{routine.durationMinutes} min</span>}
                {(routine.daysOfWeek || []).map((day) => <span key={day} className="chip">{DAYS[day]}</span>)}
                {(routine.tags || []).map((tagId) => {
                  const tag = tags.find((value) => value.id === tagId);
                  return tag ? <span key={tagId} className="chip tag-chip" style={{ color: tag.color, borderColor: `${tag.color}55` }}># {tag.label}</span> : null;
                })}
                <LinkedChips links={routine.links} items={items} routines={routines} />
              </div>
            </div>
            <button className="icon-action-btn" title="Edit" type="button" onClick={() => startEdit(routine)}>Edit</button>
            <button className="icon-action-btn danger" title="Delete" type="button" onClick={() => deleteRoutine(routine.id)}>x</button>
          </div>
        ))}
      </div>

      <div className="routine-form-card">
        <h3 className="section-title">{editId ? "Edit routine" : "Add routine"}</h3>
        <input className="field" type="text" placeholder="Routine title *" value={draft.title} onChange={(event) => update("title", event.target.value)} />
        <textarea className="textarea" placeholder="Routine description" value={draft.description || draft.text || ""} onChange={(event) => {
          const value = event.target.value;
          setDraft((previous) => ({ ...previous, description: value, text: value }));
        }} />

        <div className="form-row">
          <input className="field" type="time" value={draft.startTime || draft.time || ""} onChange={(event) => {
            const value = event.target.value;
            setDraft((previous) => ({ ...previous, startTime: value, time: value }));
          }} />
          <select className="select" value={draft.priority || "normal"} onChange={(event) => update("priority", event.target.value)}>
            {PRIORITY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label} priority</option>)}
          </select>
        </div>

        <div className="form-row">
          <select className="select" value={draft.status || "open"} onChange={(event) => update("status", event.target.value)}>
            {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <input className="field" type="number" min="0" placeholder="Duration minutes" value={draft.durationMinutes || ""} onChange={(event) => update("durationMinutes", event.target.value)} />
        </div>

        <div className="form-row">
          <label className="field-label">Due date<input className="field" type="date" value={draft.dueDate || ""} onChange={(event) => update("dueDate", event.target.value)} /></label>
          <label className="field-label">Reminder<input className="field" type="time" value={draft.reminderTime || ""} onChange={(event) => update("reminderTime", event.target.value)} /></label>
        </div>

        <div className="form-row">
          <label className="field-label">Start date<input className="field" type="date" value={draft.startDate || ""} onChange={(event) => update("startDate", event.target.value)} /></label>
          <label className="field-label">
            Parent task
            <select className="select" value={draft.parentId || ""} onChange={(event) => update("parentId", event.target.value)}>
              <option value="">None</option>
              {items.filter((item) => item.type === "task").map((task) => <option key={task.id} value={task.id}>{task.title || "Untitled task"}</option>)}
            </select>
          </label>
        </div>

        <div className="day-picker">
          {DAYS.map((label, index) => (
            <button key={label} type="button" className={`day-pick-btn ${draft.daysOfWeek.includes(index) ? "active" : ""}`} onClick={() => toggleDay(index)}>{label}</button>
          ))}
        </div>

        {tags.length > 0 && (
          <div className="field-block">
            <p className="field-title">Tags</p>
            <div className="tag-picker">
              {tags.map((tag) => {
                const active = (draft.tags || []).includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    className={`tag-pick-btn ${active ? "active" : ""}`}
                    style={active ? { background: tag.color, color: "#fff", borderColor: tag.color } : { borderColor: `${tag.color}88`, color: tag.color }}
                    onClick={() => update("tags", active ? draft.tags.filter((id) => id !== tag.id) : [...(draft.tags || []), tag.id])}
                  >
                    # {tag.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="field-block">
          <p className="field-title">Linked work</p>
          <EntityLinksPicker items={items} routines={routines} links={draft.links || []} currentEntity={editId ? routines.find((routine) => routine.id === editId) : null} onChange={(links) => update("links", links)} />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button className="pill-btn primary" type="button" onClick={saveRoutine} style={{ flex: 1 }}>{editId ? "Save changes" : "Add routine"}</button>
          {editId && <button className="pill-btn" type="button" onClick={cancelEdit}>Cancel</button>}
        </div>
      </div>
    </div>
  );
}
