import { useMemo } from "react";
import ModernCard from "./ModernCard.jsx";

const PRIORITY_ORDER = { high: 0, normal: 1, low: 2 };

export default function ItemFeed({ items, mode, tags, allItems = items, routines = [], onDelete, onToggleDone, onConvert, onStartPomodoro, onOpenLinkDialog }) {
  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      if (mode === "tasks") {
        return Number(a.done) - Number(b.done) || PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || (a.time || "").localeCompare(b.time || "");
      }
      return Number(b.isPinned) - Number(a.isPinned) || b.createdAt - a.createdAt;
    });
  }, [items, mode]);

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <p>No {mode} for this day.</p>
      </div>
    );
  }

  return (
    <div className="feed" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {sorted.map((item) => (
        <ModernCard 
          key={item.id} 
          item={item} 
          tags={tags} 
          items={allItems} 
          routines={routines} 
          onToggleDone={onToggleDone} 
          onDelete={onDelete} 
          onConvert={onConvert} 
          onStartPomodoro={onStartPomodoro}
          onOpenLinkDialog={onOpenLinkDialog}
        />
      ))}
    </div>
  );
}
