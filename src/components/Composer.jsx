export default function Composer({ mode, noteDraft, onAdd, onNoteChange, onTaskChange, taskDraft, tags }) {
  const isTask = mode === "tasks";

  function updateTask(field, value) {
    onTaskChange({ ...taskDraft, [field]: value });
  }

  function toggleTag(tagId) {
    const current = taskDraft.tags || [];
    const next = current.includes(tagId) ? current.filter((t) => t !== tagId) : [...current, tagId];
    updateTask("tags", next);
  }

  function toggleNoteTag(tagId) {
    const current = noteDraft.tags || [];
    const next = current.includes(tagId) ? current.filter((t) => t !== tagId) : [...current, tagId];
    onNoteChange({ ...noteDraft, tags: next });
  }

  const activeTags = isTask ? (taskDraft.tags || []) : (noteDraft.tags || []);
  const toggleTagFn = isTask ? toggleTag : toggleNoteTag;

  return (
    <section className="composer">
      <h3>{isTask ? "Add task" : "Add note"}</h3>

      {isTask ? (
        <>
          <input
            className="field"
            type="text"
            placeholder="Task title *"
            value={taskDraft.title}
            onChange={(e) => updateTask("title", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onAdd()}
          />
          <div className="form-row">
            <input
              className="field"
              type="time"
              aria-label="Task time"
              value={taskDraft.time}
              onChange={(e) => updateTask("time", e.target.value)}
            />
            <select
              className="select"
              aria-label="Task priority"
              value={taskDraft.priority}
              onChange={(e) => updateTask("priority", e.target.value)}
            >
              <option value="normal">Normal</option>
              <option value="high">🔴 High</option>
              <option value="low">🔵 Low</option>
            </select>
          </div>
          <textarea
            className="textarea"
            placeholder="Optional details"
            value={taskDraft.text}
            onChange={(e) => updateTask("text", e.target.value)}
          />
        </>
      ) : (
        <>
          <input
            className="field"
            type="text"
            placeholder="Note title (optional)"
            value={noteDraft.title || ""}
            onChange={(e) => onNoteChange({ ...noteDraft, title: e.target.value })}
          />
          <textarea
            className="textarea"
            placeholder="Write your note…"
            value={noteDraft.text || ""}
            onChange={(e) => onNoteChange({ ...noteDraft, text: e.target.value })}
          />
          <label className="pin-toggle">
            <input
              type="checkbox"
              checked={noteDraft.isPinned || false}
              onChange={(e) => onNoteChange({ ...noteDraft, isPinned: e.target.checked })}
            />
            📌 Pin this note
          </label>
        </>
      )}

      {tags && tags.length > 0 && (
        <div className="tag-picker">
          <span className="muted" style={{ fontSize: 12 }}>Tags:</span>
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              className={`tag-pick-btn ${activeTags.includes(tag.id) ? "active" : ""}`}
              style={
                activeTags.includes(tag.id)
                  ? { background: tag.color, color: "#fff", borderColor: tag.color }
                  : { borderColor: tag.color + "88", color: tag.color }
              }
              onClick={() => toggleTagFn(tag.id)}
            >
              # {tag.label}
            </button>
          ))}
        </div>
      )}

      <button className="pill-btn primary" type="button" onClick={onAdd}>
        {isTask ? "Add task" : "Add note"}
      </button>
    </section>
  );
}
