export default function AgendaView({ selectedDate, items, routineSuggestions, tags, onToggleDone, onDelete, onAddAtTime }) {
  const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM – 11 PM

  const dateItems = items.filter((item) => item.date === selectedDate);
  const timed = dateItems.filter((item) => item.time);
  const unscheduled = dateItems.filter((item) => !item.time);

  function itemsAtHour(h) {
    return timed.filter((item) => {
      const [hh] = (item.time || "00:00").split(":").map(Number);
      return hh === h;
    });
  }

  function routinesAtHour(h) {
    return (routineSuggestions || []).filter((r) => {
      const [hh] = (r.time || "00:00").split(":").map(Number);
      return r.time && hh === h;
    });
  }

  function pad(n) { return String(n).padStart(2, "0"); }
  function formatHour(h) {
    const ampm = h < 12 ? "AM" : "PM";
    const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${display}:00 ${ampm}`;
  }

  return (
    <div className="agenda-view">
      {unscheduled.length > 0 && (
        <div className="agenda-section">
          <div className="agenda-time-label">Unscheduled</div>
          <div className="agenda-slots">
            {unscheduled.map((item) => (
              <AgendaCard key={item.id} item={item} tags={tags} onToggleDone={onToggleDone} onDelete={onDelete} />
            ))}
          </div>
        </div>
      )}

      {hours.map((h) => {
        const slotItems = itemsAtHour(h);
        const slotRoutines = routinesAtHour(h);
        const isEmpty = slotItems.length === 0 && slotRoutines.length === 0;

        return (
          <div key={h} className={`agenda-row ${isEmpty ? "empty-hour" : ""}`}>
            <div className="agenda-time-label">{formatHour(h)}</div>
            <div className="agenda-slots">
              {slotRoutines.map((r) => (
                <div key={r.id} className="agenda-routine-chip">
                  🔁 {r.title} <span className="muted">(routine)</span>
                </div>
              ))}
              {slotItems.map((item) => (
                <AgendaCard key={item.id} item={item} tags={tags} onToggleDone={onToggleDone} onDelete={onDelete} />
              ))}
              {isEmpty && (
                <button
                  className="agenda-add-slot"
                  type="button"
                  onClick={() => onAddAtTime && onAddAtTime(`${pad(h)}:00`)}
                >
                  + Add
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AgendaCard({ item, tags, onToggleDone, onDelete }) {
  return (
    <div className={`agenda-card priority-${item.priority || "normal"} ${item.done ? "done-card" : ""}`}>
      <div className="priority-bar" />
      {item.type === "task" && (
        <button
          className={`check ${item.done ? "done" : ""}`}
          type="button"
          onClick={() => onToggleDone(item.id)}
        />
      )}
      {item.type === "note" && <span className="note-icon">📝</span>}
      <div className="item-body" style={{ flex: 1 }}>
        <div className={`item-title ${item.done ? "done" : ""}`}>{item.title || "Note"}</div>
        {item.text && <p className="muted">{item.text}</p>}
        <div className="meta">
          {(item.tags || []).map((tagId) => {
            const tag = (tags || []).find((t) => t.id === tagId);
            return tag ? (
              <span
                key={tagId}
                className="chip tag-chip"
                style={{ background: tag.color + "22", color: tag.color, borderColor: tag.color + "55" }}
              >
                # {tag.label}
              </span>
            ) : null;
          })}
        </div>
      </div>
      <button className="delete" type="button" onClick={() => onDelete(item.id)}>✕</button>
    </div>
  );
}
