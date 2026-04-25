import { useState, useMemo } from "react";
import EntityLinksPicker from "../components/EntityLinksPicker.jsx";
import LinkedChips from "../components/LinkedChips.jsx";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "../utils/entities.js";
import ModernCard from "../components/ModernCard.jsx";

export default function NotesPage({ items, tags, routines = [], onDelete, onUpdateItem, onConvert, onOpenLinkDialog }) {
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [layout, setLayout] = useState("grid"); // "grid" | "list"
  const [expandedId, setExpandedId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);

  const notes = useMemo(() => {
    let result = items.filter((i) => i.type === "note");
    const q = search.trim().toLowerCase();
    if (q) result = result.filter((i) => `${i.title} ${i.description || i.text}`.toLowerCase().includes(q));
    if (tagFilter !== "all") result = result.filter((i) => (i.tags || []).includes(tagFilter));
    return [...result].sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || b.createdAt - a.createdAt);
  }, [items, search, tagFilter]);

  function openNote(note) {
    setExpandedId(note.id);
    setEditDraft({
      title: note.title,
      description: note.description || note.text || "",
      text: note.description || note.text || "",
      priority: note.priority || "normal",
      status: note.status || "open",
      dueDate: note.dueDate || "",
      reminderTime: note.reminderTime || "",
      startDate: note.startDate || "",
      startTime: note.startTime || note.time || "",
      durationMinutes: note.durationMinutes || "",
      completionTime: note.completionTime || "",
      parentId: note.parentId || "",
      links: note.links || [],
      isPinned: note.isPinned,
      tags: note.tags || [],
      color: note.color,
    });
  }

  function saveNote() {
    const done = editDraft.status === "completed";
    onUpdateItem(expandedId, { ...editDraft, done, completionTime: done ? (editDraft.completionTime || new Date().toISOString()) : "", updatedAt: Date.now() });
    setExpandedId(null);
    setEditDraft(null);
  }

  function toggleEditTag(tagId) {
    const cur = editDraft.tags || [];
    setEditDraft((d) => ({ ...d, tags: cur.includes(tagId) ? cur.filter((t) => t !== tagId) : [...cur, tagId] }));
  }

  const expandedNote = expandedId ? items.find((i) => i.id === expandedId) : null;

  return (
    <div className="page notes-page">
      <div className="page-header">
        <h2 className="page-title">📝 All Notes</h2>
        <div className="page-stats">
          <span className="stat-chip">{notes.length} notes</span>
          <span className="stat-chip">{notes.filter((n) => n.isPinned).length} pinned</span>
        </div>
      </div>

      <div className="filter-bar">
        <input className="field page-search" type="search" placeholder="Search notes…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="select" value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
          <option value="all">All Tags</option>
          {tags.map((t) => <option key={t.id} value={t.id}># {t.label}</option>)}
        </select>
        <div className="layout-toggle">
          <button className={`pill-btn ${layout === "grid" ? "active-view" : ""}`} type="button" onClick={() => setLayout("grid")}>⊞ Grid</button>
          <button className={`pill-btn ${layout === "list" ? "active-view" : ""}`} type="button" onClick={() => setLayout("list")}>☰ List</button>
        </div>
      </div>

      {notes.length === 0 && <div className="empty-state">No notes found.</div>}

      <div className={layout === "grid" ? "notes-grid" : "notes-list"}>
        {notes.map((note) => (
          <ModernCard
            key={note.id}
            item={note}
            tags={tags}
            items={items}
            routines={routines}
            onDelete={onDelete}
            onConvert={onConvert}
            onOpenLinkDialog={onOpenLinkDialog}
            onEdit={() => openNote(note)}
          />
        ))}
      </div>

      {/* Note editor overlay */}
      {expandedId && editDraft && (
        <div className="modal-overlay" onClick={() => setExpandedId(null)}>
          <div className="modal-card note-editor" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Edit Note</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="pill-btn" type="button" onClick={() => { onConvert(expandedId); setExpandedId(null); }}>↔ To Task</button>
                <button className="icon-btn" type="button" onClick={() => setExpandedId(null)}>✕</button>
              </div>
            </div>
            <input className="field" placeholder="Title" value={editDraft.title} onChange={(e) => setEditDraft((d) => ({ ...d, title: e.target.value }))} />
            <textarea className="textarea note-editor-body" placeholder="Note content..." value={editDraft.description ?? editDraft.text} onChange={(e) => setEditDraft((d) => ({ ...d, description: e.target.value, text: e.target.value }))} />
            <div className="form-row">
              <select className="select" value={editDraft.priority || "normal"} onChange={(e) => setEditDraft((d) => ({ ...d, priority: e.target.value }))}>
                {PRIORITY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label} priority</option>)}
              </select>
              <select className="select" value={editDraft.status || "open"} onChange={(e) => setEditDraft((d) => ({ ...d, status: e.target.value }))}>
                {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label className="field-label">Due date<input className="field" type="date" value={editDraft.dueDate || ""} onChange={(e) => setEditDraft((d) => ({ ...d, dueDate: e.target.value }))} /></label>
              <label className="field-label">Reminder<input className="field" type="time" value={editDraft.reminderTime || ""} onChange={(e) => setEditDraft((d) => ({ ...d, reminderTime: e.target.value }))} /></label>
            </div>
            <div className="form-row">
              <label className="field-label">Start date<input className="field" type="date" value={editDraft.startDate || ""} onChange={(e) => setEditDraft((d) => ({ ...d, startDate: e.target.value }))} /></label>
              <label className="field-label">Start time<input className="field" type="time" value={editDraft.startTime || ""} onChange={(e) => setEditDraft((d) => ({ ...d, startTime: e.target.value, time: e.target.value }))} /></label>
            </div>
            <div className="form-row">
              <label className="field-label">Duration minutes<input className="field" type="number" min="0" value={editDraft.durationMinutes || ""} onChange={(e) => setEditDraft((d) => ({ ...d, durationMinutes: e.target.value }))} /></label>
              <label className="field-label">
                Parent task
                <select className="select" value={editDraft.parentId || ""} onChange={(e) => setEditDraft((d) => ({ ...d, parentId: e.target.value }))}>
                  <option value="">None</option>
                  {items.filter((item) => item.type === "task").map((task) => <option key={task.id} value={task.id}>{task.title || "Untitled task"}</option>)}
                </select>
              </label>
            </div>
            <label className="pin-toggle">
              <input type="checkbox" checked={editDraft.isPinned} onChange={(e) => setEditDraft((d) => ({ ...d, isPinned: e.target.checked }))} />
              📌 Pinned
            </label>
            {tags.length > 0 && (
              <div className="tag-picker">
                {tags.map((tag) => (
                  <button key={tag.id} type="button" className={`tag-pick-btn ${(editDraft.tags || []).includes(tag.id) ? "active" : ""}`}
                    style={(editDraft.tags || []).includes(tag.id) ? { background: tag.color, color: "#fff", borderColor: tag.color } : { borderColor: tag.color + "88", color: tag.color }}
                    onClick={() => toggleEditTag(tag.id)}>
                    # {tag.label}
                  </button>
                ))}
              </div>
            )}
            <div className="field-block">
              <p className="field-title">Linked work</p>
              <EntityLinksPicker items={items} routines={routines} links={editDraft.links || []} currentEntity={expandedNote} onChange={(links) => setEditDraft((d) => ({ ...d, links }))} />
            </div>
            <button className="pill-btn primary" style={{ width: "100%" }} type="button" onClick={saveNote}>Save Note</button>
          </div>
        </div>
      )}
    </div>
  );
}
