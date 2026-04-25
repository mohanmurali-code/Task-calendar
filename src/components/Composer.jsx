export default function Composer({ mode, taskDraft, noteDraft, tags, onTaskChange, onNoteChange, onAdd }) {
  function updateTask(f, v) { onTaskChange({ ...taskDraft, [f]: v }); }
  function updateNote(f, v) { onNoteChange({ ...noteDraft, [f]: v }); }

  function toggleTaskTag(id) {
    const cur = taskDraft.tags || [];
    updateTask("tags", cur.includes(id) ? cur.filter(t => t !== id) : [...cur, id]);
  }

  function toggleNoteTag(id) {
    const cur = noteDraft.tags || [];
    updateNote("tags", cur.includes(id) ? cur.filter(t => t !== id) : [...cur, id]);
  }

  if (mode === "tasks") {
    return (
      <section className="composer">
        <h3>Add task</h3>
        <input 
          className="field" 
          placeholder="Task title *" 
          value={taskDraft.title} 
          onChange={(e) => updateTask("title", e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && taskDraft.title) onAdd(); }} 
        />
        <div className="form-row">
          <input className="field" type="time" value={taskDraft.time} onChange={(e) => updateTask("time", e.target.value)} />
          <select className="select" value={taskDraft.priority} onChange={(e) => updateTask("priority", e.target.value)}>
            <option value="normal">Normal</option>
            <option value="high">🔴 High</option>
            <option value="low">🔵 Low</option>
          </select>
        </div>
        <textarea className="textarea" placeholder="Optional details..." value={taskDraft.text} onChange={(e) => updateTask("text", e.target.value)} />
        
        {tags.length > 0 && (
          <div className="tag-picker">
            {tags.map((tag) => (
              <button key={tag.id} type="button" className={`tag-pick-btn ${(taskDraft.tags || []).includes(tag.id) ? "active" : ""}`}
                style={(taskDraft.tags || []).includes(tag.id) ? { background: tag.color, color: "#fff", borderColor: tag.color } : { borderColor: tag.color + "88", color: tag.color }}
                onClick={() => toggleTaskTag(tag.id)}>
                # {tag.label}
              </button>
            ))}
          </div>
        )}

        <button className="pill-btn primary" type="button" onClick={() => onAdd()} disabled={!taskDraft.title.trim()}>
          Add task
        </button>
      </section>
    );
  }

  return (
    <section className="composer">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>Add note</h3>
        <label className="pin-toggle">
          <input type="checkbox" checked={noteDraft.isPinned} onChange={(e) => updateNote("isPinned", e.target.checked)} />
          📌 Pin
        </label>
      </div>
      <input className="field" placeholder="Note title (optional)" value={noteDraft.title} onChange={(e) => updateNote("title", e.target.value)} />
      <textarea className="textarea" placeholder="Write your note here... *" value={noteDraft.text} onChange={(e) => updateNote("text", e.target.value)} />
      
      {tags.length > 0 && (
        <div className="tag-picker">
          {tags.map((tag) => (
            <button key={tag.id} type="button" className={`tag-pick-btn ${(noteDraft.tags || []).includes(tag.id) ? "active" : ""}`}
              style={(noteDraft.tags || []).includes(tag.id) ? { background: tag.color, color: "#fff", borderColor: tag.color } : { borderColor: tag.color + "88", color: tag.color }}
              onClick={() => toggleNoteTag(tag.id)}>
              # {tag.label}
            </button>
          ))}
        </div>
      )}

      <button className="pill-btn primary" type="button" onClick={() => onAdd()} disabled={!noteDraft.text.trim()}>
        Save note
      </button>
    </section>
  );
}
