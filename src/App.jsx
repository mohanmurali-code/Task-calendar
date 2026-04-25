import { useMemo, useState, useCallback } from "react";
import { localStorageAdapter as storage } from "./storage/localStorageAdapter.js";
import { formatDateKey, fromDateKey, toDateKey } from "./utils/date.js";
import CalendarPanel from "./components/CalendarPanel.jsx";
import ItemFeed from "./components/ItemFeed.jsx";
import Composer from "./components/Composer.jsx";
import PomodoroTimer from "./components/PomodoroTimer.jsx";
import AgendaPage from "./pages/AgendaPage.jsx";
import TasksPage from "./pages/TasksPage.jsx";
import NotesPage from "./pages/NotesPage.jsx";
import RoutinesPage from "./pages/RoutinesPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

const todayKey = toDateKey(new Date());

function createItemId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const POMO_DURATIONS = { focus: 25*60, shortBreak: 5*60, longBreak: 15*60 };
const INITIAL_POMO = { activeTaskId:null, activeTaskTitle:"", timeLeft:POMO_DURATIONS.focus, phase:"focus", sessionCount:0, isRunning:false };

export default function App() {
  const [items, setItems] = useState(() => storage.loadItems());
  const [tags, setTags] = useState(() => storage.loadTags());
  const [routines, setRoutines] = useState(() => storage.loadRoutines());
  const [profile, setProfile] = useState(() => storage.loadProfile());

  const [currentMonth, setCurrentMonth] = useState(() => {
    const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [activePage, setActivePage] = useState("calendar");
  const [mode, setMode] = useState("tasks");
  const [searchQuery, setSearchQuery] = useState("");
  const [taskFilter, setTaskFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState(null);

  const [taskDraft, setTaskDraft] = useState({ title:"", time:"", priority:"normal", text:"", tags:[] });
  const [noteDraft, setNoteDraft] = useState({ title:"", text:"", isPinned:false, tags:[] });

  // Pomodoro
  const [pomo, setPomo] = useState(INITIAL_POMO);

  // Long-press agenda opener
  window.__openAgenda = () => setActivePage("agenda");

  // ── Persistence ───────────────────────────────────────
  function persist(next) { setItems(next); storage.saveItems(next); }
  function persistTags(t) { setTags(t); storage.saveTags(t); }
  function persistRoutines(r) { setRoutines(r); storage.saveRoutines(r); }
  function persistProfile(p) { setProfile(p); storage.saveProfile(p); }

  // ── Derived ───────────────────────────────────────────
  const monthItems = useMemo(() => {
    const y = currentMonth.getFullYear(), m = currentMonth.getMonth();
    return items.filter((i) => { const d = fromDateKey(i.date); return d.getFullYear()===y && d.getMonth()===m; });
  }, [currentMonth, items]);

  const selectedItems = useMemo(
    () => items.filter((i) => i.date===selectedDate && i.type===(mode==="tasks"?"task":"note")),
    [items, mode, selectedDate]
  );

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let r = selectedItems;
    if (q) r = r.filter((i) => `${i.title} ${i.text}`.toLowerCase().includes(q));
    if (tagFilter) r = r.filter((i) => (i.tags||[]).includes(tagFilter));
    if (mode==="tasks") {
      if (taskFilter==="open") r = r.filter((i) => !i.done);
      if (taskFilter==="done") r = r.filter((i) => i.done);
      if (taskFilter==="high") r = r.filter((i) => i.priority==="high");
      return [...r].sort((a,b) => Number(a.done)-Number(b.done) || (a.time||"").localeCompare(b.time||""));
    }
    return [...r].sort((a,b) => Number(b.isPinned)-Number(a.isPinned) || b.createdAt-a.createdAt);
  }, [mode, searchQuery, selectedItems, taskFilter, tagFilter]);

  const monthStats = useMemo(() => {
    const t = monthItems.filter((i) => i.type==="task");
    return { tasks:t.length, done:t.filter((i) => i.done).length, notes:monthItems.filter((i) => i.type==="note").length };
  }, [monthItems]);

  // ── Actions ───────────────────────────────────────────
  function changeMonth(o) { setCurrentMonth((v) => new Date(v.getFullYear(), v.getMonth()+o, 1)); }

  function selectDate(key) {
    setSelectedDate(key);
    const d = fromDateKey(key);
    setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  }

  function selectToday() { selectDate(toDateKey(new Date())); }

  function addItem(overrideTime) {
    const ts = Date.now();
    if (mode==="tasks") {
      if (!taskDraft.title.trim()) return;
      persist([...items, { id:createItemId(), date:selectedDate, type:"task", title:taskDraft.title.trim(), text:taskDraft.text.trim(), time:overrideTime||taskDraft.time, priority:taskDraft.priority, tags:taskDraft.tags||[], done:false, isPinned:false, isRoutine:false, routineId:null, pomodoroCount:0, color:null, createdAt:ts, updatedAt:ts }]);
      setTaskDraft({ title:"", time:"", priority:"normal", text:"", tags:[] });
    } else {
      if (!noteDraft.text?.trim()) return;
      persist([...items, { id:createItemId(), date:selectedDate, type:"note", title:noteDraft.title?.trim()||"", text:noteDraft.text.trim(), time:"", priority:"normal", tags:noteDraft.tags||[], done:false, isPinned:noteDraft.isPinned||false, isRoutine:false, routineId:null, pomodoroCount:0, color:null, createdAt:ts, updatedAt:ts }]);
      setNoteDraft({ title:"", text:"", isPinned:false, tags:[] });
    }
  }

  function toggleDone(id) { persist(items.map((i) => i.id===id ? { ...i, done:!i.done, updatedAt:Date.now() } : i)); }
  function deleteItem(id) { persist(items.filter((i) => i.id!==id)); }
  function clearDone() { persist(items.filter((i) => !(i.date===selectedDate && i.type==="task" && i.done))); }

  function updateItem(id, fields) {
    persist(items.map((i) => i.id===id ? { ...i, ...fields, updatedAt:Date.now() } : i));
  }

  // ── Convert ───────────────────────────────────────────
  function convertItem(id) {
    const item = items.find((i) => i.id===id);
    if (!item) return;
    const newType = item.type==="task" ? "note" : "task";
    persist(items.map((i) => i.id===id ? { ...i, type:newType, updatedAt:Date.now() } : i));
  }

  // ── Pomodoro ──────────────────────────────────────────
  function startPomodoro(task) {
    setPomo({ activeTaskId:task.id, activeTaskTitle:task.title, timeLeft:POMO_DURATIONS.focus, phase:"focus", sessionCount:0, isRunning:true });
  }

  const pomoTick = useCallback((action) => {
    if (action==="togglePlay") { setPomo((p) => ({ ...p, isRunning:!p.isRunning })); return; }
    setPomo((p) => {
      if (p.timeLeft > 1) return { ...p, timeLeft:p.timeLeft-1 };
      // Phase complete
      if (navigator.vibrate) navigator.vibrate([200,100,200]);
      if (p.phase==="focus") {
        const newCount = p.sessionCount+1;
        // Save pomodoro count to item
        setItems((prev) => {
          const updated = prev.map((i) => i.id===p.activeTaskId ? { ...i, pomodoroCount:(i.pomodoroCount||0)+1 } : i);
          storage.saveItems(updated);
          return updated;
        });
        const nextPhase = newCount%4===0 ? "longBreak" : "shortBreak";
        return { ...p, phase:nextPhase, timeLeft:POMO_DURATIONS[nextPhase], sessionCount:newCount, isRunning:true };
      } else {
        return { ...p, phase:"focus", timeLeft:POMO_DURATIONS.focus, isRunning:true };
      }
    });
  }, []);

  function pomoSkip() {
    setPomo((p) => {
      if (p.phase==="focus") {
        const next = (p.sessionCount+1)%4===0 ? "longBreak" : "shortBreak";
        return { ...p, phase:next, timeLeft:POMO_DURATIONS[next] };
      }
      return { ...p, phase:"focus", timeLeft:POMO_DURATIONS.focus };
    });
  }

  function pomoStop() { setPomo(INITIAL_POMO); }

  function clearAll() {
    storage.clearAll();
    setItems([]); setTags([]); setRoutines([]);
    setProfile({ name:"", initials:"ME", color:"#7c4dff" });
  }

  // ── Render ────────────────────────────────────────────
  return (
    <main className="app">
      {/* Top bar */}
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">TC</div>
          <div>
            <h1>Task Calendar</h1>
            <p className="muted">Plan · Focus · Achieve</p>
          </div>
        </div>
        <div className="actions">
          {activePage==="calendar" && (
            <>
              <button className="icon-btn" type="button" onClick={() => changeMonth(-1)}>‹</button>
              <button className="pill-btn primary" type="button" onClick={selectToday}>Today</button>
              <button className="icon-btn" type="button" onClick={() => changeMonth(1)}>›</button>
            </>
          )}
          <div className="avatar" style={{ background:profile.color, cursor:"pointer" }} onClick={() => setActivePage("profile")}>{profile.initials}</div>
        </div>
      </header>

      {/* Desktop nav tabs */}
      <nav className="desktop-nav">
        {[
          { key:"calendar", icon:"📅", label:"Calendar" },
          { key:"agenda", icon:"📋", label:"Agenda" },
          { key:"tasks", icon:"✅", label:"Tasks" },
          { key:"notes", icon:"📝", label:"Notes" },
          { key:"routines", icon:"🔁", label:"Routines" },
          { key:"profile", icon:"👤", label:"Profile" },
        ].map((tab) => (
          <button key={tab.key} className={`nav-tab ${activePage===tab.key ? "active" : ""}`} type="button" onClick={() => setActivePage(tab.key)}>
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </nav>

      {/* ── Page content ─────────────────────────── */}

      {activePage==="calendar" && (
        <section className="shell">
          <CalendarPanel currentMonth={currentMonth} items={items} monthStats={monthStats} selectedDate={selectedDate} onSelectDate={selectDate} onChangeMonth={changeMonth} />
          <aside className="sidebar">
            <section className="sidebar-card">
              <div className="selected-head">
                <div>
                  <h3>{formatDateKey(selectedDate, {weekday:"long"})}</h3>
                  <p className="muted">{formatDateKey(selectedDate, {month:"long", day:"numeric", year:"numeric"})}</p>
                </div>
                <button className="pill-btn" type="button" onClick={clearDone}>Clear done</button>
              </div>
              <div className="tabs">
                <button className={`tab-btn ${mode==="tasks"?"active":""}`} type="button" onClick={() => setMode("tasks")}>Tasks</button>
                <button className={`tab-btn ${mode==="notes"?"active":""}`} type="button" onClick={() => setMode("notes")}>Notes</button>
              </div>
              {tags.length>0 && (
                <div className="tag-filter-row">
                  <button className={`tag-filter-btn ${!tagFilter?"active":""}`} type="button" onClick={() => setTagFilter(null)}>All</button>
                  {tags.map((t) => (
                    <button key={t.id} className={`tag-filter-btn ${tagFilter===t.id?"active":""}`} type="button"
                      style={tagFilter===t.id?{background:t.color,color:"#fff",borderColor:t.color}:{borderColor:t.color+"88",color:t.color}}
                      onClick={() => setTagFilter(tagFilter===t.id?null:t.id)}># {t.label}</button>
                  ))}
                </div>
              )}
              <div className="search-row">
                <input className="field" type="search" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <select className="select" value={taskFilter} onChange={(e) => setTaskFilter(e.target.value)}>
                  <option value="all">All</option><option value="open">Open</option><option value="done">Done</option><option value="high">High</option>
                </select>
              </div>
              <ItemFeed items={filteredItems} mode={mode} tags={tags} onDelete={deleteItem} onToggleDone={toggleDone} onConvert={convertItem} onStartPomodoro={startPomodoro} onTagFilter={(id) => setTagFilter(tagFilter===id?null:id)} />
            </section>
            <Composer mode={mode} noteDraft={noteDraft} taskDraft={taskDraft} tags={tags} onAdd={addItem} onNoteChange={setNoteDraft} onTaskChange={setTaskDraft} />
          </aside>
        </section>
      )}

      {activePage==="agenda" && (
        <AgendaPage items={items} tags={tags} routines={routines} selectedDate={selectedDate} onSelectDate={selectDate} onToggleDone={toggleDone} onDelete={deleteItem} onAddAtTime={(t) => { setMode("tasks"); setTaskDraft((d) => ({...d, time:t})); setActivePage("calendar"); }} />
      )}

      {activePage==="tasks" && (
        <TasksPage items={items} tags={tags} onToggleDone={toggleDone} onDelete={deleteItem} onConvert={convertItem} onUpdateItem={updateItem} onStartPomodoro={startPomodoro} />
      )}

      {activePage==="notes" && (
        <NotesPage items={items} tags={tags} onDelete={deleteItem} onUpdateItem={updateItem} onConvert={convertItem} />
      )}

      {activePage==="routines" && (
        <RoutinesPage routines={routines} onRoutinesChange={persistRoutines} items={items} onPersistItems={persist} tags={tags} />
      )}

      {activePage==="profile" && (
        <ProfilePage profile={profile} items={items} routines={routines} tags={tags} onProfileChange={persistProfile} onTagsChange={persistTags} onClearAll={clearAll} />
      )}

      {/* Mobile dock */}
      <nav className="mobile-dock">
        {[
          { key:"calendar", icon:"📅", label:"Cal" },
          { key:"agenda", icon:"📋", label:"Agenda" },
          { key:"tasks", icon:"✅", label:"Tasks" },
          { key:"notes", icon:"📝", label:"Notes" },
          { key:"routines", icon:"🔁", label:"Routines" },
          { key:"profile", icon:"👤", label:"Me" },
        ].map((tab) => (
          <button key={tab.key} className={`dock-btn ${activePage===tab.key?"dock-active":""}`} type="button" onClick={() => setActivePage(tab.key)}>
            <span className="dock-icon">{tab.icon}</span>
            <span className="dock-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Pomodoro overlay */}
      {pomo.activeTaskId && <PomodoroTimer state={pomo} onTick={pomoTick} onSkip={pomoSkip} onStop={pomoStop} />}
    </main>
  );
}
