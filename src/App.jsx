import { useMemo, useState } from "react";
import { localStorageAdapter as storage } from "./storage/localStorageAdapter.js";
import { formatDateKey, fromDateKey, monthLabel, toDateKey } from "./utils/date.js";
import CalendarPanel from "./components/CalendarPanel.jsx";
import ItemFeed from "./components/ItemFeed.jsx";
import Composer from "./components/Composer.jsx";
import AgendaView from "./components/AgendaView.jsx";
import TagManager from "./components/TagManager.jsx";
import RoutineManager from "./components/RoutineManager.jsx";
import ProfilePanel from "./components/ProfilePanel.jsx";

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
  const [tags, setTags] = useState(() => storage.loadTags());
  const [routines, setRoutines] = useState(() => storage.loadRoutines());
  const [profile, setProfile] = useState(() => storage.loadProfile());

  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(todayKey);

  // view: "calendar" | "agenda"
  const [view, setView] = useState("calendar");
  // activeTab on mobile dock: "calendar" | "agenda" | "routines" | "profile"
  const [activeTab, setActiveTab] = useState("calendar");

  const [mode, setMode] = useState("tasks");
  const [searchQuery, setSearchQuery] = useState("");
  const [taskFilter, setTaskFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState(null);

  const [taskDraft, setTaskDraft] = useState({ title: "", time: "", priority: "normal", text: "", tags: [] });
  const [noteDraft, setNoteDraft] = useState({ title: "", text: "", isPinned: false, tags: [] });

  // Modals
  const [showTagManager, setShowTagManager] = useState(false);
  const [showRoutineManager, setShowRoutineManager] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Expose agenda opener for long-press callback
  window.__openAgenda = () => { setView("agenda"); setActiveTab("agenda"); };

  // ── Derived data ──────────────────────────────────────

  const monthItems = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return items.filter((item) => {
      const d = fromDateKey(item.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [currentMonth, items]);

  const selectedItems = useMemo(
    () => items.filter((item) => item.date === selectedDate && item.type === (mode === "tasks" ? "task" : "note")),
    [items, mode, selectedDate],
  );

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let result = selectedItems;

    if (query) result = result.filter((item) => escapeSearchValue(item).includes(query));
    if (tagFilter) result = result.filter((item) => (item.tags || []).includes(tagFilter));

    if (mode === "tasks") {
      if (taskFilter === "open") result = result.filter((item) => !item.done);
      if (taskFilter === "done") result = result.filter((item) => item.done);
      if (taskFilter === "high") result = result.filter((item) => item.priority === "high");
      return [...result].sort((a, b) => Number(a.done) - Number(b.done) || (a.time || "").localeCompare(b.time || ""));
    }

    // Notes: pinned first
    return [...result].sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || b.createdAt - a.createdAt);
  }, [mode, searchQuery, selectedItems, taskFilter, tagFilter]);

  const monthStats = useMemo(() => {
    const tasks = monthItems.filter((i) => i.type === "task");
    return {
      tasks: tasks.length,
      done: tasks.filter((i) => i.done).length,
      notes: monthItems.filter((i) => i.type === "note").length,
    };
  }, [monthItems]);

  // Routine suggestions for selected date
  const routineSuggestions = useMemo(() => {
    const dow = fromDateKey(selectedDate).getDay();
    return routines.filter((r) => r.daysOfWeek.includes(dow));
  }, [routines, selectedDate]);

  // ── Persistence helpers ───────────────────────────────

  function persist(nextItems) { setItems(nextItems); storage.saveItems(nextItems); }
  function persistTags(t) { setTags(t); storage.saveTags(t); }
  function persistRoutines(r) { setRoutines(r); storage.saveRoutines(r); }
  function persistProfile(p) { setProfile(p); storage.saveProfile(p); }

  // ── Actions ───────────────────────────────────────────

  function changeMonth(offset) {
    setCurrentMonth((v) => new Date(v.getFullYear(), v.getMonth() + offset, 1));
  }

  function selectDate(key) {
    const date = fromDateKey(key);
    setSelectedDate(key);
    setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  }

  function selectToday() { selectDate(toDateKey(new Date())); }

  function addItem(overrideTime) {
    const timestamp = Date.now();
    if (mode === "tasks") {
      if (!taskDraft.title.trim()) return;
      persist([...items, {
        id: createItemId(), date: selectedDate, type: "task",
        title: taskDraft.title.trim(), text: taskDraft.text.trim(),
        time: overrideTime || taskDraft.time, priority: taskDraft.priority,
        tags: taskDraft.tags || [], done: false, isPinned: false,
        createdAt: timestamp, updatedAt: timestamp,
      }]);
      setTaskDraft({ title: "", time: "", priority: "normal", text: "", tags: [] });
    } else {
      if (!noteDraft.text?.trim()) return;
      persist([...items, {
        id: createItemId(), date: selectedDate, type: "note",
        title: noteDraft.title?.trim() || "", text: noteDraft.text.trim(),
        time: "", priority: "normal", tags: noteDraft.tags || [],
        done: false, isPinned: noteDraft.isPinned || false,
        createdAt: timestamp, updatedAt: timestamp,
      }]);
      setNoteDraft({ title: "", text: "", isPinned: false, tags: [] });
    }
  }

  function toggleDone(id) {
    persist(items.map((item) => item.id === id ? { ...item, done: !item.done, updatedAt: Date.now() } : item));
  }

  function deleteItem(id) { persist(items.filter((item) => item.id !== id)); }

  function clearDone() {
    persist(items.filter((item) => !(item.date === selectedDate && item.type === "task" && item.done)));
  }

  function clearAll() {
    storage.clearAll();
    setItems([]); setTags([]); setRoutines([]);
    setProfile({ name: "", initials: "ME", color: "#7c4dff" });
    setShowProfile(false);
  }

  // ── Tab switching helper ──────────────────────────────

  function switchTab(tab) {
    setActiveTab(tab);
    if (tab === "calendar") setView("calendar");
    if (tab === "agenda") setView("agenda");
    if (tab === "routines") setShowRoutineManager(true);
    if (tab === "profile") setShowProfile(true);
  }

  const activeTagObj = tagFilter ? tags.find((t) => t.id === tagFilter) : null;

  // ── Render ────────────────────────────────────────────

  return (
    <main className="app">
      {/* ── Top bar ──────────────────────────────────── */}
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">TC</div>
          <div>
            <h1>Task Calendar</h1>
            <p className="muted">Plan your day, swipe your month.</p>
          </div>
        </div>
        <div className="actions">
          <button className="icon-btn" type="button" aria-label="Previous month" onClick={() => changeMonth(-1)}>‹</button>
          <button className="pill-btn primary" type="button" onClick={selectToday}>Today</button>
          <button className="icon-btn" type="button" aria-label="Next month" onClick={() => changeMonth(1)}>›</button>
          <button className="icon-btn" type="button" title="Tags" onClick={() => setShowTagManager(true)}>🏷</button>
          <div
            className="avatar"
            aria-label="Profile"
            style={{ background: profile.color, cursor: "pointer" }}
            onClick={() => setShowProfile(true)}
          >
            {profile.initials}
          </div>
        </div>
      </header>

      {/* ── View toggle pills (desktop) ───────────────── */}
      <div className="view-toggle desktop-only">
        <button className={`pill-btn ${view === "calendar" ? "active-view" : ""}`} type="button" onClick={() => setView("calendar")}>📅 Calendar</button>
        <button className={`pill-btn ${view === "agenda" ? "active-view" : ""}`} type="button" onClick={() => setView("agenda")}>📋 Agenda</button>
      </div>

      {/* ── Main shell ───────────────────────────────── */}
      <section className="shell">
        {view === "calendar" ? (
          <CalendarPanel
            currentMonth={currentMonth}
            items={items}
            monthStats={monthStats}
            selectedDate={selectedDate}
            onSelectDate={selectDate}
            onChangeMonth={changeMonth}
          />
        ) : (
          <AgendaView
            selectedDate={selectedDate}
            items={items}
            routineSuggestions={routineSuggestions}
            tags={tags}
            onToggleDone={toggleDone}
            onDelete={deleteItem}
            onAddAtTime={(t) => { setMode("tasks"); setTaskDraft((d) => ({ ...d, time: t })); }}
          />
        )}

        {/* ── Sidebar ──────────────────────────────── */}
        <aside className="sidebar">
          <section className="sidebar-card">
            <div className="selected-head">
              <div>
                <h3>{formatDateKey(selectedDate, { weekday: "long" })}</h3>
                <p className="muted">{formatDateKey(selectedDate, { month: "long", day: "numeric", year: "numeric" })}</p>
              </div>
              <button className="pill-btn" type="button" onClick={clearDone}>Clear done</button>
            </div>

            {/* Routine suggestions banner */}
            {routineSuggestions.length > 0 && (
              <div className="routine-banner">
                🔁 {routineSuggestions.length} routine{routineSuggestions.length > 1 ? "s" : ""} scheduled today
              </div>
            )}

            <div className="tabs">
              <button className={`tab-btn ${mode === "tasks" ? "active" : ""}`} type="button" onClick={() => setMode("tasks")}>Tasks</button>
              <button className={`tab-btn ${mode === "notes" ? "active" : ""}`} type="button" onClick={() => setMode("notes")}>Notes</button>
            </div>

            {/* Tag filter row */}
            {tags.length > 0 && (
              <div className="tag-filter-row">
                <button
                  className={`tag-filter-btn ${!tagFilter ? "active" : ""}`}
                  type="button"
                  onClick={() => setTagFilter(null)}
                >All</button>
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    className={`tag-filter-btn ${tagFilter === tag.id ? "active" : ""}`}
                    style={tagFilter === tag.id ? { background: tag.color, color: "#fff", borderColor: tag.color } : { borderColor: tag.color + "88", color: tag.color }}
                    onClick={() => setTagFilter(tagFilter === tag.id ? null : tag.id)}
                  >
                    # {tag.label}
                  </button>
                ))}
                <button className="icon-btn" style={{ width: 30, minHeight: 30, fontSize: 14 }} type="button" onClick={() => setShowTagManager(true)} title="Manage tags">+</button>
              </div>
            )}

            <div className="search-row">
              <input className="field" type="search" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <select className="select" aria-label="Filter tasks" value={taskFilter} onChange={(e) => setTaskFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="done">Done</option>
                <option value="high">High</option>
              </select>
            </div>

            <ItemFeed
              items={filteredItems}
              mode={mode}
              tags={tags}
              onDelete={deleteItem}
              onToggleDone={toggleDone}
              onTagFilter={(id) => setTagFilter(tagFilter === id ? null : id)}
            />
          </section>

          <Composer
            mode={mode}
            noteDraft={noteDraft}
            taskDraft={taskDraft}
            tags={tags}
            onAdd={addItem}
            onNoteChange={setNoteDraft}
            onTaskChange={setTaskDraft}
          />
        </aside>
      </section>

      {/* ── Mobile Dock ──────────────────────────────── */}
      <nav className="mobile-dock" aria-label="Navigation">
        <button
          className={`dock-btn ${activeTab === "calendar" ? "dock-active" : ""}`}
          type="button"
          onClick={() => switchTab("calendar")}
        >
          <span className="dock-icon">📅</span>
          <span className="dock-label">Calendar</span>
        </button>
        <button
          className={`dock-btn ${activeTab === "agenda" ? "dock-active" : ""}`}
          type="button"
          onClick={() => switchTab("agenda")}
        >
          <span className="dock-icon">📋</span>
          <span className="dock-label">Agenda</span>
        </button>
        <button
          className="dock-btn dock-add-btn"
          type="button"
          onClick={() => { document.querySelector(".composer")?.scrollIntoView({ behavior: "smooth" }); }}
        >
          <span className="dock-icon dock-plus">＋</span>
        </button>
        <button
          className={`dock-btn ${activeTab === "routines" ? "dock-active" : ""}`}
          type="button"
          onClick={() => switchTab("routines")}
        >
          <span className="dock-icon">🔁</span>
          <span className="dock-label">Routines</span>
        </button>
        <button
          className={`dock-btn ${activeTab === "profile" ? "dock-active" : ""}`}
          type="button"
          onClick={() => switchTab("profile")}
        >
          <span className="dock-icon">👤</span>
          <span className="dock-label">Profile</span>
        </button>
      </nav>

      {/* ── Modals ───────────────────────────────────── */}
      {showTagManager && (
        <TagManager tags={tags} onTagsChange={persistTags} onClose={() => setShowTagManager(false)} />
      )}
      {showRoutineManager && (
        <RoutineManager routines={routines} onRoutinesChange={persistRoutines} tags={tags} onClose={() => setShowRoutineManager(false)} />
      )}
      {showProfile && (
        <ProfilePanel profile={profile} onProfileChange={persistProfile} onClearAll={clearAll} onClose={() => setShowProfile(false)} />
      )}
    </main>
  );
}
