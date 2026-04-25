import { useState, useMemo } from "react";

export default function NotesPage({ items, tags, onDelete, onUpdateItem, onConvert }) {
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [layout, setLayout] = useState("grid"); // "grid" | "list"
  const [expandedId, setExpandedId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);

  const notes = useMemo(() => {
    let result = items.filter((i) => i.type === "note");
    const q = search.trim().toLowerCase();
    if (q) result = result.filter((i) => `${i.title} ${i.text}`.toLowerCase().includes(q));
    if (tagFilter !== "all") result = result.filter((i) => (i.tags || []).includes(tagFilter));
    return [...result].sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || b.createdAt - a.createdAt);
  }, [items, search, tagFilter]);

  function openNote(note) {
    setExpandedId(note.id);
    setEditDraft({ title: note.title, text: note.text, isPinned: note.isPinned, tags: note.tags || [], color: note.color });
  }

  function saveNote() {
    onUpdateItem(expandedId, { ...editDraft, updatedAt: Date.now() });
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
          <div
            key={note.id}
            className={`note-card-full ${note.isPinned ? "pinned" : ""}`}
            style={note.color ? { borderTopColor: note.color } : {}}
            onClick={() => openNote(note)}
          >
            <div className="note-card-header">
              <div className="item-title">{note.title || "Untitled Note"}</div>
              <div className="note-card-actions" onClick={(e) => e.stopPropagation()}>
                {note.isPinned && <span title="Pinned">📌</span>}
                <button className="icon-action-btn" title="Convert to Task" type="button" onClick={() => onConvert(note.id)}>↔</button>
                <button className="icon-action-btn danger" title="Delete" type="button" onClick={() => onDelete(note.id)}>✕</button>
              </div>
            </div>
            <p className="muted note-preview">{note.text}</p>
            <div className="meta">
              <span className="chip">{new Date(note.createdAt).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>
              {(note.tags || []).map((tid) => {
                const tag = tags.find((t) => t.id === tid);
                return tag ? <span key={tid} className="chip tag-chip" style={{ color: tag.color, borderColor: tag.color + "55" }}># {tag.label}</span> : null;
              })}
            </div>
          </div>
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
            <textarea className="textarea note-editor-body" placeholder="Note content…" value={editDraft.text} onChange={(e) => setEditDraft((d) => ({ ...d, text: e.target.value }))} />
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
            <button className="pill-btn primary" style={{ width: "100%" }} type="button" onClick={saveNote}>Save Note</button>
          </div>
        </div>
      )}
    </div>
  );
}
