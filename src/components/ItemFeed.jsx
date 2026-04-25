export default function ItemFeed({ items, mode, tags, onDelete, onToggleDone, onTagFilter }) {
  if (!items.length) {
    return (
      <div className="empty-state">
        {mode === "tasks" ? "No tasks for this day." : "No notes for this day."}
      </div>
    );
  }

  return (
    <div className="feed">
      {items.map((item) => (
        <article
          className={`item-card priority-${item.priority || "normal"} ${item.isPinned ? "pinned" : ""}`}
          key={item.id}
        >
          <div className="priority-bar" />
          {item.type === "task" ? (
            <>
              <button
                className={`check ${item.done ? "done" : ""}`}
                type="button"
                aria-label="Toggle task"
                onClick={() => onToggleDone(item.id)}
              />
              <div className="item-body">
                <div className={`item-title ${item.done ? "done" : ""}`}>{item.title}</div>
                {item.text && <p className="muted">{item.text}</p>}
                <div className="meta">
                  {item.time && <span className="chip">⏰ {item.time}</span>}
                  <span className={`chip priority-chip ${item.priority}`}>{item.priority}</span>
                  {(item.tags || []).map((tagId) => {
                    const tag = (tags || []).find((t) => t.id === tagId);
                    return tag ? (
                      <span
                        key={tagId}
                        className="chip tag-chip"
                        style={{ background: tag.color + "22", color: tag.color, borderColor: tag.color + "55" }}
                        onClick={() => onTagFilter && onTagFilter(tagId)}
                      >
                        # {tag.label}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="note-icon">📝</div>
              <div className="item-body">
                {item.title && <div className="item-title">{item.title}</div>}
                <p className="muted note-text">{item.text}</p>
                <div className="meta">
                  <span className="chip">
                    {new Date(item.createdAt).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {item.isPinned && <span className="chip">📌 Pinned</span>}
                  {(item.tags || []).map((tagId) => {
                    const tag = (tags || []).find((t) => t.id === tagId);
                    return tag ? (
                      <span
                        key={tagId}
                        className="chip tag-chip"
                        style={{ background: tag.color + "22", color: tag.color, borderColor: tag.color + "55" }}
                        onClick={() => onTagFilter && onTagFilter(tagId)}
                      >
                        # {tag.label}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            </>
          )}
          <button className="delete" type="button" aria-label="Delete item" onClick={() => onDelete(item.id)}>
            ✕
          </button>
        </article>
      ))}
    </div>
  );
}
