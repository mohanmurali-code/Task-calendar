import { useState } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function createRoutineId() {
  return `routine-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function RoutineManager({ routines, onRoutinesChange, tags, onClose }) {
  const [draft, setDraft] = useState({ title: "", time: "", priority: "normal", daysOfWeek: [], tags: [] });

  function update(field, value) {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  function toggleDay(d) {
    const current = draft.daysOfWeek;
    update("daysOfWeek", current.includes(d) ? current.filter((x) => x !== d) : [...current, d]);
  }

  function addRoutine() {
    if (!draft.title.trim() || draft.daysOfWeek.length === 0) return;
    onRoutinesChange([...routines, { id: createRoutineId(), ...draft, title: draft.title.trim() }]);
    setDraft({ title: "", time: "", priority: "normal", daysOfWeek: [], tags: [] });
  }

  function deleteRoutine(id) {
    onRoutinesChange(routines.filter((r) => r.id !== id));
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card routine-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>🔁 Routine Tasks</h3>
          <button className="icon-btn" type="button" onClick={onClose}>✕</button>
        </div>

        <div className="tag-list">
          {routines.length === 0 && <p className="muted" style={{ textAlign: "center" }}>No routines yet.</p>}
          {routines.map((r) => (
            <div key={r.id} className="tag-row">
              <div style={{ flex: 1 }}>
                <strong>{r.title}</strong>
                <div className="muted" style={{ fontSize: 12 }}>
                  {r.time && `⏰ ${r.time} · `}
                  {r.daysOfWeek.map((d) => DAYS[d]).join(", ")}
                </div>
              </div>
              <button className="delete" type="button" onClick={() => deleteRoutine(r.id)}>✕</button>
            </div>
          ))}
        </div>

        <div className="routine-form">
          <input
            className="field"
            type="text"
            placeholder="Routine title *"
            value={draft.title}
            onChange={(e) => update("title", e.target.value)}
          />
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
              <button
                key={i}
                type="button"
                className={`day-pick-btn ${draft.daysOfWeek.includes(i) ? "active" : ""}`}
                onClick={() => toggleDay(i)}
              >
                {label}
              </button>
            ))}
          </div>
          <button className="pill-btn primary" type="button" onClick={addRoutine}>
            Add Routine
          </button>
        </div>
      </div>
    </div>
  );
}
