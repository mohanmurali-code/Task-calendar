import { useState } from "react";
import { buildMonthDays, formatDateKey, monthLabel } from "../utils/date.js";

const todayKey = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
})();

export default function CalendarPanel({ currentMonth, items, monthStats, onSelectDate, onChangeMonth, selectedDate }) {
  const month = buildMonthDays(currentMonth);
  const [dragState, setDragState] = useState({ isDragging: false, startX: 0, startY: 0, currentX: 0 });
  const [animating, setAnimating] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [pressingKey, setPressingKey] = useState(null);
  const longPressRefs = {};

  function handlePointerDown(e) {
    if (animating) return;
    e.target.setPointerCapture(e.pointerId);
    setDragState({ isDragging: true, startX: e.clientX, startY: e.clientY, currentX: e.clientX });
  }

  function handlePointerMove(e) {
    if (!dragState.isDragging) return;
    setDragState((prev) => ({ ...prev, currentX: e.clientX }));
  }

  function handlePointerUp(e) {
    if (!dragState.isDragging) return;
    e.target.releasePointerCapture(e.pointerId);
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    setDragState({ isDragging: false, startX: 0, startY: 0, currentX: 0 });

    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      const direction = dx < 0 ? 1 : -1;
      setAnimating(true);
      setDragX(direction > 0 ? -window.innerWidth : window.innerWidth);
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);
      setTimeout(() => {
        onChangeMonth(direction);
        setDragX(direction > 0 ? window.innerWidth : -window.innerWidth);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          setDragX(0);
          setTimeout(() => setAnimating(false), 300);
        }));
      }, 300);
    } else {
      setDragX(0);
    }
  }

  function startLongPress(key, e) {
    setPressingKey(key);
    longPressRefs[key] = setTimeout(() => {
      setPressingKey(null);
      if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
      onSelectDate(key);
      if (typeof window.__openAgenda === "function") window.__openAgenda();
    }, 450);
  }

  function cancelLongPress(key) {
    setPressingKey(null);
    clearTimeout(longPressRefs[key]);
  }

  const currentDragX = dragState.isDragging ? dragState.currentX - dragState.startX : dragX;
  const transition = dragState.isDragging || (animating && Math.abs(dragX) > 500) ? "none" : "transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)";

  return (
    <section className="panel" aria-label="Calendar">
      <div className="calendar-head">
        <div>
          <h2 className="month-title">{monthLabel(currentMonth)}</h2>
          <p className="muted">{formatDateKey(selectedDate, { weekday: "long", month: "short", day: "numeric" })} selected</p>
        </div>
        <div className="stats">
          <div className="stat"><strong>{monthStats.tasks}</strong><span className="muted">Tasks</span></div>
          <div className="stat"><strong>{monthStats.done}</strong><span className="muted">Done</span></div>
          <div className="stat"><strong>{monthStats.notes}</strong><span className="muted">Notes</span></div>
        </div>
      </div>

      <div className="weekdays">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div
        className="calendar-grid"
        onPointerCancel={handlePointerUp}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ transform: `translateX(${currentDragX}px)`, transition, willChange: "transform" }}
      >
        {Array.from({ length: month.firstDay }, (_, i) => <div className="empty" key={`empty-${i}`} />)}
        {month.days.map(({ day, key }) => {
          const tasks = items.filter((item) => item.date === key && item.type === "task");
          const notes = items.filter((item) => item.date === key && item.type === "note");
          const taskCount = tasks.length;
          const heatLevel = taskCount === 0 ? "" : taskCount <= 2 ? "heat-1" : taskCount <= 4 ? "heat-2" : "heat-3";

          return (
            <button
              className={`day ${key === todayKey ? "is-today" : ""} ${key === selectedDate ? "is-selected" : ""} ${heatLevel} ${pressingKey === key ? "pressing" : ""}`}
              type="button"
              key={key}
              onPointerDown={(e) => { e.stopPropagation(); startLongPress(key, e); }}
              onPointerUp={(e) => { e.stopPropagation(); cancelLongPress(key); onSelectDate(key); }}
              onPointerLeave={() => cancelLongPress(key)}
              onPointerCancel={() => cancelLongPress(key)}
            >
              <span className="day-number">{day}</span>
              <span className="day-summary">
                {tasks.length > 0 && (
                  <span className="mini-row">
                    <span className="dot" />
                    {tasks.length} task{tasks.length > 1 ? "s" : ""}
                  </span>
                )}
                {notes.length > 0 && (
                  <span className="mini-row">
                    <span className="dot note" />
                    {notes.length} note{notes.length > 1 ? "s" : ""}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
