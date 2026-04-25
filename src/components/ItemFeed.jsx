import { useMemo } from "react";

const PRIORITY_ORDER = { high: 0, normal: 1, low: 2 };

export default function ItemFeed({ items, mode, tags, onDelete, onToggleDone, onConvert, onStartPomodoro, onTagFilter }) {
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
    <div className="feed">
      {sorted.map((item) => (
        <div key={item.id} className={`item-card ${item.isPinned ? "pinned" : ""} priority-${item.priority || "normal"} ${item.type === "task" && item.done ? "task-done" : ""}`} style={item.color && item.type === "note" ? { borderTopColor: item.color } : {}}>
          <div className="priority-bar" />
          
          {item.type === "task" ? (
            <button className={`check ${item.done ? "done" : ""}`} type="button" onClick={() => onToggleDone(item.id)} />
          ) : (
            <span className="note-icon">{item.isPinned ? "📌" : "📝"}</span>
          )}

          <div className="item-body">
            <div className={`item-title ${item.type === "task" && item.done ? "done" : ""}`}>
              {item.title || (item.type === "note" ? "Untitled Note" : "")}
            </div>
            {item.text && <div className="note-text muted" style={{ fontSize: 13, marginTop: 4 }}>{item.text}</div>}
            
            <div className="meta">
              {item.time && <span className="chip">⏰ {item.time}</span>}
              {(item.tags || []).map((tid) => {
                const tag = tags.find((t) => t.id === tid);
                if (!tag) return null;
                return (
                  <span key={tid} className="chip tag-chip" style={{ color: tag.color, borderColor: tag.color + "55", background: tag.color + "18" }} onClick={() => onTagFilter && onTagFilter(tid)}>
                    # {tag.label}
                  </span>
                );
              })}
              {item.pomodoroCount > 0 && <span className="chip pomo-badge">🍅×{item.pomodoroCount}</span>}
            </div>
          </div>

          <div className="item-actions" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {item.type === "task" && onStartPomodoro && (
              <button className="icon-action-btn" title="Start Pomodoro" type="button" onClick={() => onStartPomodoro(item)}>🍅</button>
            )}
            {onConvert && (
              <button className="icon-action-btn" title={`Convert to ${item.type === "task" ? "Note" : "Task"}`} type="button" onClick={() => onConvert(item.id)}>↔</button>
            )}
            <button className="delete" type="button" onClick={() => onDelete(item.id)}>✕</button>
          </div>
        </div>
      ))}
    </div>
  );
}
