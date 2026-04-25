import { useState, useMemo } from "react";
import { toDateKey, fromDateKey } from "../utils/date.js";

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
function createRoutineId() { return `routine-${Date.now()}-${Math.random().toString(16).slice(2)}`; }

export default function RoutinesPage({ routines, onRoutinesChange, items, onPersistItems, tags }) {
  const todayKey = toDateKey(new Date());
  const todayDow = new Date().getDay();

  const [draft, setDraft] = useState({ title:"", time:"", priority:"normal", daysOfWeek:[], tags:[] });
  const [editId, setEditId] = useState(null);

  const todayRoutines = useMemo(() => routines.filter((r) => r.daysOfWeek.includes(todayDow)), [routines, todayDow]);

  function update(f, v) { setDraft((p) => ({ ...p, [f]: v })); }
  function toggleDay(d) { update("daysOfWeek", draft.daysOfWeek.includes(d) ? draft.daysOfWeek.filter((x) => x!==d) : [...draft.daysOfWeek, d]); }

  function saveRoutine() {
    if (!draft.title.trim() || draft.daysOfWeek.length === 0) return;
    if (editId) {
      onRoutinesChange(routines.map((r) => r.id === editId ? { ...r, ...draft, title: draft.title.trim() } : r));
      setEditId(null);
    } else {
      onRoutinesChange([...routines, { id: createRoutineId(), ...draft, title: draft.title.trim() }]);
    }
    setDraft({ title:"", time:"", priority:"normal", daysOfWeek:[], tags:[] });
  }

  function startEdit(r) { setEditId(r.id); setDraft({ title:r.title, time:r.time||"", priority:r.priority||"normal", daysOfWeek:r.daysOfWeek, tags:r.tags||[] }); }
  function cancelEdit() { setEditId(null); setDraft({ title:"", time:"", priority:"normal", daysOfWeek:[], tags:[] }); }
  function deleteRoutine(id) { onRoutinesChange(routines.filter((r) => r.id !== id)); }

  // Check off a routine for today — creates a real task if not already present
  function checkRoutineToday(routine) {
    const already = items.find((i) => i.type==="task" && i.date===todayKey && i.routineId===routine.id);
    if (already) return;
    const newTask = {
      id: `item-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      date: todayKey, type:"task",
      title: routine.title, text:"", time: routine.time||"",
      priority: routine.priority||"normal", tags: routine.tags||[],
      done:false, isPinned:false, isRoutine:true, routineId:routine.id,
      pomodoroCount:0, createdAt:Date.now(), updatedAt:Date.now(),
    };
    onPersistItems([...items, newTask]);
  }

  function isCheckedToday(routine) {
    return items.some((i) => i.type==="task" && i.date===todayKey && i.routineId===routine.id);
  }

  return (
    <div className="page routines-page">
      <div className="page-header">
        <h2 className="page-title">🔁 Routines</h2>
        <div className="page-stats">
          <span className="stat-chip">{routines.length} routines</span>
          <span className="stat-chip">{todayRoutines.length} today</span>
        </div>
      </div>

      {/* Today's Routines */}
      {todayRoutines.length > 0 && (
        <div className="routine-today-section">
          <h3 className="section-title">Today's Routines</h3>
          {todayRoutines.map((r) => {
            const checked = isCheckedToday(r);
            return (
              <div key={r.id} className={`routine-today-card ${checked ? "checked" : ""}`}>
                <button className={`check ${checked ? "done" : ""}`} type="button" onClick={() => checkRoutineToday(r)} />
                <div>
                  <div className="item-title" style={checked ? { textDecoration:"line-through", color:"var(--muted)" } : {}}>{r.title}</div>
                  {r.time && <span className="muted" style={{ fontSize:12 }}>⏰ {r.time}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* All Routines */}
      <div className="routine-list">
        <h3 className="section-title">All Routines</h3>
        {routines.length === 0 && <div className="empty-state">No routines yet. Add one below.</div>}
        {routines.map((r) => (
          <div key={r.id} className="routine-card-row">
            <div style={{ flex:1 }}>
              <div className="item-title">{r.title}</div>
              <div className="meta">
                {r.time && <span className="chip">⏰ {r.time}</span>}
                <span className={`chip priority-chip ${r.priority}`}>{r.priority}</span>
                {r.daysOfWeek.map((d) => <span key={d} className="chip">{DAYS[d]}</span>)}
              </div>
            </div>
            <button className="icon-action-btn" title="Edit" type="button" onClick={() => startEdit(r)}>✏️</button>
            <button className="icon-action-btn danger" title="Delete" type="button" onClick={() => deleteRoutine(r.id)}>✕</button>
          </div>
        ))}
      </div>

      {/* Add / Edit Form */}
      <div className="routine-form-card">
        <h3 className="section-title">{editId ? "Edit Routine" : "Add Routine"}</h3>
        <input className="field" type="text" placeholder="Routine title *" value={draft.title} onChange={(e) => update("title", e.target.value)} />
        <div className="form-row">
          <input className="field" type="time" value={draft.time} onChange={(e) => update("time", e.target.value)} />
          <select className="select" value={draft.priority} onChange={(e) => update("priority", e.target.value)}>
            <option value="normal">Normal</option>
            <option value="high">🔴 High</option>
            <option value="low">🔵 Low</option>
          </select>
        </div>
        <div className="day-picker">
          {DAYS.map((label, i) => (
            <button key={i} type="button" className={`day-pick-btn ${draft.daysOfWeek.includes(i) ? "active" : ""}`} onClick={() => toggleDay(i)}>{label}</button>
          ))}
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button className="pill-btn primary" type="button" onClick={saveRoutine} style={{ flex:1 }}>{editId ? "Save Changes" : "Add Routine"}</button>
          {editId && <button className="pill-btn" type="button" onClick={cancelEdit}>Cancel</button>}
        </div>
      </div>
    </div>
  );
}
