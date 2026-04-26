import { useState } from "react";
import { useToast } from "./ToastProvider.jsx";

const PRIORITY_COLORS = { high: "#f45d8f", normal: "#7c4dff", low: "#2196f3" };
const PRIORITY_LABELS = { high: "High", normal: "Normal", low: "Low" };

function CardIcon({ type }) {
  const common = { width:"18", height:"18", viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"2", strokeLinecap:"round", strokeLinejoin:"round", "aria-hidden":"true" };
  if (type === "pin") return <svg {...common}><path d="m14 4 6 6" /><path d="M5 19 19 5" /><path d="m8 16-3 3" /><path d="m15 3 6 6-4 4-6-6z" /></svg>;
  if (type === "note") return <svg {...common}><path d="M6 4h9l3 3v13H6z" /><path d="M14 4v4h4M9 13h6M9 17h4" /></svg>;
  if (type === "time") return <svg {...common}><circle cx="12" cy="12" r="8" /><path d="M12 8v5l3 2" /></svg>;
  if (type === "calendar") return <svg {...common}><rect x="4" y="5" width="16" height="15" rx="4" /><path d="M8 3v4M16 3v4M4 10h16" /></svg>;
  if (type === "focus") return <svg {...common}><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="2" /></svg>;
  if (type === "link") return <svg {...common}><path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" /></svg>;
  if (type === "convert") return <svg {...common}><path d="M17 3l4 4-4 4" /><path d="M3 7h18" /><path d="M7 21l-4-4 4-4" /><path d="M21 17H3" /></svg>;
  if (type === "edit") return <svg {...common}><path d="M12 20h9" /><path d="m16.5 3.5 4 4L8 20l-5 1 1-5z" /></svg>;
  if (type === "delete") return <svg {...common}><path d="M6 7h12" /><path d="M9 7V5h6v2" /><path d="m10 11 4 4M14 11l-4 4" /><path d="M8 7l1 13h6l1-13" /></svg>;
  return null;
}

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
            <span className="modern-icon"><CardIcon type={item.isPinned ? "pin" : "note"} /></span>
          )}
          <div className="modern-title-area">
            <h4 className="modern-title">{item.title || (isTask ? "Untitled Task" : "Untitled Note")}</h4>
            <div className="modern-meta-row">
              {(item.startTime || item.time) && <span className="modern-meta-pill"><CardIcon type="time" /> {item.startTime || item.time}</span>}
              {(item.dueDate) && <span className="modern-meta-pill"><CardIcon type="calendar" /> Due: {item.dueDate}</span>}
              <span className="modern-meta-pill" style={{ color: priorityColor }}><span className="dot" style={{ background: priorityColor }}></span> {PRIORITY_LABELS[item.priority] || "Normal"}</span>
              {item.pomodoroCount > 0 && <span className="modern-meta-pill pomo-badge"><CardIcon type="focus" /> {item.pomodoroCount}</span>}
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
                        <span className="icon">{link.type === "task" ? "Task" : link.type === "routine" ? "Routine" : "Note"}</span>
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
                <CardIcon type="focus" /> Focus
              </button>
            )}
            {onOpenLinkDialog && (
              <button className="modern-btn" onClick={(e) => { e.stopPropagation(); onOpenLinkDialog(item); }}>
                <CardIcon type="link" /> Link
              </button>
            )}
            {onConvert && (
              <button className="modern-btn" onClick={handleConvert}>
                <CardIcon type="convert" /> Convert
              </button>
            )}
            {onEdit && (
              <button className="modern-btn" onClick={(e) => { e.stopPropagation(); onEdit(item); }}>
                <CardIcon type="edit" /> Edit
              </button>
            )}
          </div>
          <div className="modern-actions-right">
            <button className="modern-btn danger" onClick={handleDelete}>
              <CardIcon type="delete" /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
