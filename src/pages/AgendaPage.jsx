import { useState, useMemo } from "react";
import { toDateKey, fromDateKey, weekDays, shortDayLabel, buildMonthDays, monthLabel } from "../utils/date.js";

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM–9 PM

function formatHour(h) {
  const ampm = h < 12 ? "AM" : "PM";
  const d = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${d}:00 ${ampm}`;
}

function pad(n) { return String(n).padStart(2, "0"); }

export default function AgendaPage({ items, tags, routines, selectedDate, onSelectDate, onToggleDone, onDelete, onAddAtTime }) {
  const [agendaMode, setAgendaMode] = useState("day"); // "day"|"week"|"month"
  const [weekAnchor, setWeekAnchor] = useState(() => fromDateKey(selectedDate));
  const [monthAnchor, setMonthAnchor] = useState(() => {
    const d = fromDateKey(selectedDate);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const todayKey = toDateKey(new Date());

  // ── Day view helpers ─────────────────────────────────
  const dayItems = useMemo(() => items.filter((i) => i.date === selectedDate), [items, selectedDate]);
  const timed = dayItems.filter((i) => i.time);
  const unscheduled = dayItems.filter((i) => !i.time);

  function itemsAtHour(h) { return timed.filter((i) => { const [hh] = (i.time||"00:00").split(":").map(Number); return hh === h; }); }

  const routineSuggestions = useMemo(() => {
    const dow = fromDateKey(selectedDate).getDay();
    return routines.filter((r) => r.daysOfWeek.includes(dow) && r.time);
  }, [routines, selectedDate]);
  function routinesAtHour(h) { return routineSuggestions.filter((r) => { const [hh] = (r.time||"00:00").split(":").map(Number); return hh===h; }); }

  // ── Week helpers ─────────────────────────────────────
  const weekDaysList = useMemo(() => weekDays(weekAnchor), [weekAnchor]);
  function shiftWeek(n) { const d = new Date(weekAnchor); d.setDate(d.getDate() + n*7); setWeekAnchor(d); }
  function itemsForDayHour(dateKey, h) {
    return items.filter((i) => i.date===dateKey && i.time && (parseInt(i.time.split(":")[0])===h));
  }

  // ── Month helpers ─────────────────────────────────────
  const monthData = useMemo(() => buildMonthDays(monthAnchor), [monthAnchor]);
  function shiftMonth(n) { setMonthAnchor((m) => new Date(m.getFullYear(), m.getMonth()+n, 1)); }
  function itemsForDay(key) { return items.filter((i) => i.date===key); }

  // ── Nav label ────────────────────────────────────────
  const navLabel = agendaMode === "day"
    ? fromDateKey(selectedDate).toLocaleDateString("en", { weekday:"long", month:"long", day:"numeric", year:"numeric" })
    : agendaMode === "week"
      ? `${shortDayLabel(weekDaysList[0])} – ${shortDayLabel(weekDaysList[6])}`
      : monthLabel(monthAnchor);

  function navPrev() { agendaMode==="day" ? onSelectDate(toDateKey(new Date(fromDateKey(selectedDate).setDate(fromDateKey(selectedDate).getDate()-1)))) : agendaMode==="week" ? shiftWeek(-1) : shiftMonth(-1); }
  function navNext() { agendaMode==="day" ? onSelectDate(toDateKey(new Date(fromDateKey(selectedDate).setDate(fromDateKey(selectedDate).getDate()+1)))) : agendaMode==="week" ? shiftWeek(1) : shiftMonth(1); }
  function goToday() { agendaMode==="day" ? onSelectDate(todayKey) : agendaMode==="week" ? setWeekAnchor(new Date()) : setMonthAnchor(new Date(new Date().getFullYear(), new Date().getMonth(), 1)); }

  return (
    <div className="page agenda-page">
      {/* Agenda nav */}
      <div className="agenda-nav">
        <div className="view-toggle">
          {["day","week","month"].map((m) => (
            <button key={m} className={`pill-btn ${agendaMode===m ? "active-view" : ""}`} type="button" onClick={() => setAgendaMode(m)}>
              {m.charAt(0).toUpperCase()+m.slice(1)}
            </button>
          ))}
        </div>
        <div className="agenda-nav-controls">
          <button className="icon-btn" type="button" onClick={navPrev}>‹</button>
          <button className="pill-btn" type="button" onClick={goToday}>Today</button>
          <button className="icon-btn" type="button" onClick={navNext}>›</button>
        </div>
        <div className="agenda-nav-label">{navLabel}</div>
      </div>

      {/* ── Day View ── */}
      {agendaMode === "day" && (
        <div className="agenda-view">
          {unscheduled.length > 0 && (
            <div className="agenda-unscheduled">
              <div className="agenda-section-label">Unscheduled</div>
              {unscheduled.map((item) => <AgendaCard key={item.id} item={item} tags={tags} onToggleDone={onToggleDone} onDelete={onDelete} />)}
            </div>
          )}
          <div className="agenda-timeline">
            {HOURS.map((h) => {
              const slotItems = itemsAtHour(h);
              const slotRoutines = routinesAtHour(h);
              return (
                <div key={h} className="agenda-row">
                  <div className="agenda-hour-label">{formatHour(h)}</div>
                  <div className="agenda-slots">
                    {slotRoutines.map((r) => <div key={r.id} className="agenda-routine-chip">🔁 {r.title}</div>)}
                    {slotItems.map((item) => <AgendaCard key={item.id} item={item} tags={tags} onToggleDone={onToggleDone} onDelete={onDelete} />)}
                    {slotItems.length===0 && slotRoutines.length===0 && (
                      <button className="agenda-add-slot" type="button" onClick={() => onAddAtTime && onAddAtTime(`${pad(h)}:00`)}>+ Add</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Week View ── */}
      {agendaMode === "week" && (
        <div className="week-grid">
          <div className="week-header">
            <div className="week-hour-col" />
            {weekDaysList.map((d) => {
              const key = toDateKey(d);
              return (
                <div key={key} className={`week-day-header ${key===todayKey ? "is-today" : ""} ${key===selectedDate ? "is-selected" : ""}`} onClick={() => { onSelectDate(key); setAgendaMode("day"); }}>
                  <div>{d.toLocaleDateString("en",{weekday:"short"})}</div>
                  <div className="week-day-num">{d.getDate()}</div>
                </div>
              );
            })}
          </div>
          <div className="week-body">
            {HOURS.map((h) => (
              <div key={h} className="week-row">
                <div className="week-hour-col">{formatHour(h)}</div>
                {weekDaysList.map((d) => {
                  const key = toDateKey(d);
                  const cellItems = itemsForDayHour(key, h);
                  return (
                    <div key={key} className={`week-cell ${key===selectedDate ? "selected-col" : ""}`} onClick={() => { onSelectDate(key); onAddAtTime && onAddAtTime(`${pad(h)}:00`); }}>
                      {cellItems.map((item) => (
                        <div key={item.id} className={`week-chip priority-${item.priority} ${item.done ? "done" : ""}`} title={item.title}>
                          {item.title}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Month View ── */}
      {agendaMode === "month" && (
        <div className="month-agenda">
          <div className="weekdays">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="month-grid">
            {Array.from({length: monthData.firstDay}, (_,i) => <div key={`e-${i}`} className="month-cell empty" />)}
            {monthData.days.map(({day, key}) => {
              const dayItems = itemsForDay(key);
              const shown = dayItems.slice(0,3);
              const extra = dayItems.length - 3;
              return (
                <div key={key} className={`month-cell ${key===todayKey ? "is-today" : ""} ${key===selectedDate ? "is-selected" : ""}`} onClick={() => { onSelectDate(key); setAgendaMode("day"); }}>
                  <div className="month-day-num">{day}</div>
                  {shown.map((item) => (
                    <div key={item.id} className={`month-chip priority-${item.priority} ${item.done ? "done" : ""}`}>{item.title||"Note"}</div>
                  ))}
                  {extra > 0 && <div className="month-chip-more">+{extra} more</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function AgendaCard({ item, tags, onToggleDone, onDelete }) {
  return (
    <div className={`agenda-card priority-${item.priority||"normal"} ${item.done ? "done-card" : ""}`}>
      <div className="priority-bar" />
      {item.type==="task" && <button className={`check ${item.done ? "done" : ""}`} type="button" onClick={() => onToggleDone(item.id)} />}
      {item.type==="note" && <span className="note-icon">📝</span>}
      <div className="item-body" style={{ flex:1 }}>
        <div className={`item-title ${item.done ? "done" : ""}`}>{item.title||"Note"}</div>
        {item.text && <p className="muted" style={{ fontSize:12, margin:"2px 0 0" }}>{item.text.slice(0,80)}{item.text.length>80?"…":""}</p>}
      </div>
      <button className="delete" type="button" onClick={() => onDelete(item.id)}>✕</button>
    </div>
  );
}
