import { useState } from "react";
import { useToast } from "./ToastProvider.jsx";

const PRIORITY_COLORS = { high: "#f45d8f", normal: "#7c4dff", low: "#2196f3" };
const PRIORITY_LABELS = { high: "High", normal: "Normal", low: "Low" };

export default function ModernCard({ item, tags, items, routines, onToggleDone, onDelete, onConvert, onStartPomodoro, onOpenLinkDialog, onEdit }) {
  const toast = useToast();
  const [isExpanded, setIsExpanded] = useState(false);

  const isTask = item.type === "task";
  const priorityColor = PRIORITY_COLORS[item.priority] || PRIORITY_COLORS.normal;
  const isDone = isTask && (item.done || item.status === "completed");

  const itemTags = (item.tags || []).map(tid => tags.find(t => t.id === tid)).filter(Boolean);
  
  // Resolve links
  const linkedItems = (item.links || []).map(linkId => {
    return items.find(i => i.id === linkId) || routines.find(r => r.id === linkId);
  }).filter(Boolean);

  const handleToggleDone = (e) => {
    e.stopPropagation();
    onToggleDone(item.id);
    if (!isDone) toast("Task completed! 🎉", "success");
    else toast("Task reopened.", "info");
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(item.id);
    toast("Item deleted.", "error");
  };

  const handleConvert = (e) => {
    e.stopPropagation();
    onConvert(item.id);
    toast(`Converted to ${isTask ? "Note" : "Task"}`, "info");
  };

  return (
    <div className={`modern-card ${isDone ? "is-done" : ""} ${item.isPinned ? "is-pinned" : ""}`} onClick={() => setIsExpanded(!isExpanded)}>
      <div className="modern-card-header">
        <div className="modern-card-header-main">
          {isTask ? (
            <button className={`modern-check ${isDone ? "checked" : ""}`} onClick={handleToggleDone}>
              {isDone && <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1.5 5L4.5 8L10.5 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </button>
          ) : (
            <span className="modern-icon">{item.isPinned ? "📌" : "📝"}</span>
          )}
          <div className="modern-title-area">
            <h4 className="modern-title">{item.title || (isTask ? "Untitled Task" : "Untitled Note")}</h4>
            <div className="modern-meta-row">
              {(item.startTime || item.time) && <span className="modern-meta-pill"><span className="icon">⏰</span> {item.startTime || item.time}</span>}
              {(item.dueDate) && <span className="modern-meta-pill"><span className="icon">📅</span> Due: {item.dueDate}</span>}
              <span className="modern-meta-pill" style={{ color: priorityColor }}><span className="dot" style={{ background: priorityColor }}></span> {PRIORITY_LABELS[item.priority] || "Normal"}</span>
              {item.pomodoroCount > 0 && <span className="modern-meta-pill pomo-badge">🍅 × {item.pomodoroCount}</span>}
            </div>
          </div>
        </div>
      </div>

      {(item.description || item.text || isExpanded) && (
        <div className="modern-card-body">
          {(item.description || item.text) && (
            <p className={`modern-description ${!isExpanded ? "clamped" : ""}`}>
              {item.description || item.text}
            </p>
          )}
          
          {isExpanded && (
            <div className="modern-expanded-details">
              {itemTags.length > 0 && (
                <div className="modern-tags">
                  {itemTags.map(t => (
                    <span key={t.id} className="modern-tag" style={{ background: `${t.color}15`, color: t.color, borderColor: `${t.color}40` }}>
                      #{t.label}
                    </span>
                  ))}
                </div>
              )}

              {linkedItems.length > 0 && (
                <div className="modern-links">
                  <div className="modern-links-title">Linked Items</div>
                  <div className="modern-links-list">
                    {linkedItems.map(link => (
                      <div key={link.id} className="modern-link-chip">
                        <span className="icon">{link.type === "task" ? "✅" : link.type === "routine" ? "🔁" : "📝"}</span>
                        <span className="text">{link.title || "Untitled"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {isExpanded && (
        <div className="modern-card-footer" onClick={e => e.stopPropagation()}>
          <div className="modern-actions-left">
            {isTask && onStartPomodoro && (
              <button className="modern-btn" onClick={(e) => { e.stopPropagation(); onStartPomodoro(item); }}>
                <span className="icon">🍅</span> Focus
              </button>
            )}
            {onOpenLinkDialog && (
              <button className="modern-btn" onClick={(e) => { e.stopPropagation(); onOpenLinkDialog(item); }}>
                <span className="icon">🔗</span> Link
              </button>
            )}
            {onConvert && (
              <button className="modern-btn" onClick={handleConvert}>
                <span className="icon">↔</span> Convert
              </button>
            )}
            {onEdit && (
              <button className="modern-btn" onClick={(e) => { e.stopPropagation(); onEdit(item); }}>
                <span className="icon">✏️</span> Edit
              </button>
            )}
          </div>
          <div className="modern-actions-right">
            <button className="modern-btn danger" onClick={handleDelete}>
              <span className="icon">✕</span> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
