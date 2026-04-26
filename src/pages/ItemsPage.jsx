import { useMemo, useState } from "react";
import ModernCard from "../components/ModernCard.jsx";

export default function ItemsPage({
  items,
  tags,
  routines = [],
  onToggleDone,
  onDelete,
  onConvert,
  onUpdateItem,
  onStartPomodoro,
  onOpenLinkDialog,
}) {
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");

  const filtered = useMemo(() => {
    let result = [...items];
    if (kind !== "all") result = result.filter((item) => item.type === kind);
    if (tagFilter !== "all") result = result.filter((item) => (item.tags || []).includes(tagFilter));
    const query = search.trim().toLowerCase();
    if (query) {
      result = result.filter((item) => `${item.title} ${item.description || item.text || ""}`.toLowerCase().includes(query));
    }
    return result.sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
  }, [items, kind, tagFilter, search]);

  const taskCount = items.filter((i) => i.type === "task").length;
  const noteCount = items.filter((i) => i.type === "note").length;

  return (
    <div className="page items-page">
      <div className="page-header">
        <h2 className="page-title">All Items</h2>
        <div className="page-stats">
          <span className="stat-chip">{taskCount} tasks</span>
          <span className="stat-chip">{noteCount} notes</span>
        </div>
      </div>

      <div className="filter-bar">
        <input className="field page-search" type="search" placeholder="Search tasks and notes" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="layout-toggle">
          {[
            { key: "all", label: "All" },
            { key: "task", label: "Tasks" },
            { key: "note", label: "Notes" },
          ].map((opt) => (
            <button key={opt.key} className={`pill-btn ${kind === opt.key ? "active-view" : ""}`} type="button" onClick={() => setKind(opt.key)}>
              {opt.label}
            </button>
          ))}
        </div>
        <select className="select" value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
          <option value="all">All tags</option>
          {tags.map((t) => <option key={t.id} value={t.id}># {t.label}</option>)}
        </select>
      </div>

      {filtered.length === 0 && <div className="empty-state">No items match your filters.</div>}
      <div className="items-list">
        {filtered.map((item) => (
          <ModernCard
            key={item.id}
            item={item}
            tags={tags}
            items={items}
            routines={routines}
            onToggleDone={onToggleDone}
            onDelete={onDelete}
            onConvert={onConvert}
            onUpdate={onUpdateItem}
            onStartPomodoro={onStartPomodoro}
            onOpenLinkDialog={onOpenLinkDialog}
          />
        ))}
      </div>
    </div>
  );
}
