import { useMemo, useState } from "react";
import { storage } from "./storage/index.js";
import { buildMonthDays, formatDateKey, fromDateKey, monthLabel, toDateKey } from "./utils/date.js";

const todayKey = toDateKey(new Date());

function createItemId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeSearchValue(item) {
  return `${item.title || ""} ${item.text || ""}`.toLowerCase();
}

export default function App() {
  const [items, setItems] = useState(() => storage.loadItems());
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [mode, setMode] = useState("tasks");
  const [searchQuery, setSearchQuery] = useState("");
  const [taskFilter, setTaskFilter] = useState("all");
  const [taskDraft, setTaskDraft] = useState({ title: "", time: "", priority: "normal", text: "" });
  const [noteDraft, setNoteDraft] = useState("");

  const monthItems = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return items.filter((item) => {
      const itemDate = fromDateKey(item.date);
      return itemDate.getFullYear() === year && itemDate.getMonth() === month;
    });
  }, [currentMonth, items]);

  const selectedItems = useMemo(
    () => items.filter((item) => item.date === selectedDate && item.type === (mode === "tasks" ? "task" : "note")),
    [items, mode, selectedDate],
  );

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let result = selectedItems;

    if (query) {
      result = result.filter((item) => escapeSearchValue(item).includes(query));
    }

    if (mode === "tasks") {
      if (taskFilter === "open") result = result.filter((item) => !item.done);
      if (taskFilter === "done") result = result.filter((item) => item.done);
      if (taskFilter === "high") result = result.filter((item) => item.priority === "high");
      return [...result].sort((a, b) => Number(a.done) - Number(b.done) || (a.time || "").localeCompare(b.time || ""));
    }

    return [...result].sort((a, b) => b.createdAt - a.createdAt);
  }, [mode, searchQuery, selectedItems, taskFilter]);

  const monthStats = useMemo(() => {
    const tasks = monthItems.filter((item) => item.type === "task");
    return {
      tasks: tasks.length,
      done: tasks.filter((item) => item.done).length,
      notes: monthItems.filter((item) => item.type === "note").length,
    };
  }, [monthItems]);

  function persist(nextItems) {
    setItems(nextItems);
    storage.saveItems(nextItems);
  }

  function changeMonth(offset) {
    setCurrentMonth((value) => new Date(value.getFullYear(), value.getMonth() + offset, 1));
  }

  function selectDate(key) {
    const date = fromDateKey(key);
    setSelectedDate(key);
    setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  }

  function selectToday() {
    selectDate(toDateKey(new Date()));
  }

  function addItem() {
    if (mode === "tasks" && !taskDraft.title.trim()) return;
    if (mode === "notes" && !noteDraft.trim()) return;

    const timestamp = Date.now();
    const item =
      mode === "tasks"
        ? {
            id: createItemId(),
            date: selectedDate,
            type: "task",
            title: taskDraft.title.trim(),
            text: taskDraft.text.trim(),
            time: taskDraft.time,
            priority: taskDraft.priority,
            done: false,
            createdAt: timestamp,
          }
        : {
            id: createItemId(),
            date: selectedDate,
            type: "note",
            title: "",
            text: noteDraft.trim(),
            time: "",
            priority: "normal",
            done: false,
            createdAt: timestamp,
          };

    persist([...items, item]);
    setTaskDraft({ title: "", time: "", priority: "normal", text: "" });
    setNoteDraft("");
  }

  function toggleDone(itemId) {
    persist(items.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item)));
  }

  function deleteItem(itemId) {
    persist(items.filter((item) => item.id !== itemId));
  }

  function clearDone() {
    persist(items.filter((item) => !(item.date === selectedDate && item.type === "task" && item.done)));
  }

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">TC</div>
          <div>
            <h1>Task Calendar</h1>
            <p className="muted">Plan your day, swipe your month, save everything here.</p>
          </div>
        </div>
        <div className="actions">
          <button className="icon-btn" type="button" aria-label="Previous month" onClick={() => changeMonth(-1)}>
            &lt;
          </button>
          <button className="pill-btn primary" type="button" onClick={selectToday}>
            Today
          </button>
          <button className="icon-btn" type="button" aria-label="Next month" onClick={() => changeMonth(1)}>
            &gt;
          </button>
          <div className="avatar" aria-label="Profile">
            MM
          </div>
        </div>
      </header>

      <section className="shell">
        <CalendarPanel
          currentMonth={currentMonth}
          items={items}
          monthStats={monthStats}
          selectedDate={selectedDate}
          onSelectDate={selectDate}
          onChangeMonth={changeMonth}
        />

        <aside className="sidebar">
          <section className="sidebar-card">
            <div className="selected-head">
              <div>
                <h3>{formatDateKey(selectedDate, { weekday: "long" })}</h3>
                <p className="muted">{formatDateKey(selectedDate, { month: "long", day: "numeric", year: "numeric" })}</p>
              </div>
              <button className="pill-btn" type="button" onClick={clearDone}>
                Clear done
              </button>
            </div>

            <div className="tabs">
              <button className={`tab-btn ${mode === "tasks" ? "active" : ""}`} type="button" onClick={() => setMode("tasks")}>
                Tasks
              </button>
              <button className={`tab-btn ${mode === "notes" ? "active" : ""}`} type="button" onClick={() => setMode("notes")}>
                Notes
              </button>
            </div>

            <div className="search-row">
              <input className="field" type="search" placeholder="Search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
              <select className="select" aria-label="Filter tasks" value={taskFilter} onChange={(event) => setTaskFilter(event.target.value)}>
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="done">Done</option>
                <option value="high">High</option>
              </select>
            </div>

            <ItemFeed items={filteredItems} mode={mode} onDelete={deleteItem} onToggleDone={toggleDone} />
          </section>

          <Composer mode={mode} noteDraft={noteDraft} taskDraft={taskDraft} onAdd={addItem} onNoteChange={setNoteDraft} onTaskChange={setTaskDraft} />
        </aside>
      </section>

      <nav className="mobile-dock" aria-label="Month navigation">
        <button className="icon-btn" type="button" aria-label="Previous month" onClick={() => changeMonth(-1)}>
          &lt;
        </button>
        <button className="icon-btn" type="button" aria-label="Today" onClick={selectToday}>
          +
        </button>
        <button className="icon-btn" type="button" aria-label="Next month" onClick={() => changeMonth(1)}>
          &gt;
        </button>
      </nav>
    </main>
  );
}

function CalendarPanel({ currentMonth, items, monthStats, onSelectDate, onChangeMonth, selectedDate }) {
  const month = buildMonthDays(currentMonth);
  const [dragState, setDragState] = useState({ isDragging: false, startX: 0, startY: 0, currentX: 0 });
  const [animating, setAnimating] = useState(false);
  const [dragX, setDragX] = useState(0);

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
      
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      setTimeout(() => {
        onChangeMonth(direction);
        setDragX(direction > 0 ? window.innerWidth : -window.innerWidth);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setDragX(0);
            setTimeout(() => setAnimating(false), 300);
          });
        });
      }, 300);
    } else {
      setDragX(0);
    }
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
          <Stat label="Tasks" value={monthStats.tasks} />
          <Stat label="Done" value={monthStats.done} />
          <Stat label="Notes" value={monthStats.notes} />
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
        {Array.from({ length: month.firstDay }, (_, index) => (
          <div className="empty" key={`empty-${index}`} />
        ))}
        {month.days.map(({ day, key }) => {
          const tasks = items.filter((item) => item.date === key && item.type === "task");
          const notes = items.filter((item) => item.date === key && item.type === "note");
          return (
            <button className={`day ${key === todayKey ? "is-today" : ""} ${key === selectedDate ? "is-selected" : ""}`} type="button" key={key} onClick={() => onSelectDate(key)}>
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

function Stat({ label, value }) {
  return (
    <div className="stat">
      <strong>{value}</strong>
      <span className="muted">{label}</span>
    </div>
  );
}

function ItemFeed({ items, mode, onDelete, onToggleDone }) {
  if (!items.length) {
    return <div className="empty-state">{mode === "tasks" ? "No tasks for this day." : "No notes for this day."}</div>;
  }

  return (
    <div className="feed">
      {items.map((item) => (
        <article className="item-card" key={item.id}>
          {item.type === "task" ? (
            <>
              <button className={`check ${item.done ? "done" : ""}`} type="button" aria-label="Toggle task" onClick={() => onToggleDone(item.id)} />
              <div>
                <div className={`item-title ${item.done ? "done" : ""}`}>{item.title}</div>
                {item.text && <p className="muted">{item.text}</p>}
                <div className="meta">
                  {item.time && <span className="chip">{item.time}</span>}
                  <span className="chip">{item.priority}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="avatar">N</div>
              <div>
                <div className="item-title">Note</div>
                <p className="muted">{item.text}</p>
                <div className="meta">
                  <span className="chip">{new Date(item.createdAt).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>
            </>
          )}
          <button className="delete" type="button" aria-label="Delete item" onClick={() => onDelete(item.id)}>
            x
          </button>
        </article>
      ))}
    </div>
  );
}

function Composer({ mode, noteDraft, onAdd, onNoteChange, onTaskChange, taskDraft }) {
  const isTask = mode === "tasks";

  function updateTask(field, value) {
    onTaskChange({ ...taskDraft, [field]: value });
  }

  return (
    <section className="composer">
      <h3>{isTask ? "Add task" : "Add note"}</h3>
      {isTask && (
        <>
          <input className="field" type="text" placeholder="Task title" value={taskDraft.title} onChange={(event) => updateTask("title", event.target.value)} onKeyDown={(event) => event.key === "Enter" && onAdd()} />
          <div className="form-row">
            <input className="field" type="time" aria-label="Task time" value={taskDraft.time} onChange={(event) => updateTask("time", event.target.value)} />
            <select className="select" aria-label="Task priority" value={taskDraft.priority} onChange={(event) => updateTask("priority", event.target.value)}>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="low">Low</option>
            </select>
          </div>
        </>
      )}
      <textarea className="textarea" placeholder={isTask ? "Optional details" : "Write a note"} value={isTask ? taskDraft.text : noteDraft} onChange={(event) => (isTask ? updateTask("text", event.target.value) : onNoteChange(event.target.value))} />
      <button className="pill-btn primary" type="button" onClick={onAdd}>
        {isTask ? "Add task" : "Add note"}
      </button>
    </section>
  );
}
