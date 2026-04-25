import EntityLinksPicker from "./EntityLinksPicker.jsx";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "../utils/entities.js";

export default function Composer({
  mode,
  taskDraft,
  noteDraft,
  tags,
  items = [],
  routines = [],
  onTaskChange,
  onNoteChange,
  onAdd,
}) {
  const isTask = mode === "tasks";
  const draft = isTask ? taskDraft : noteDraft;
  const update = isTask
    ? (field, value) => onTaskChange({ ...taskDraft, [field]: value })
    : (field, value) => onNoteChange({ ...noteDraft, [field]: value });
  const taskParents = items.filter((item) => item.type === "task");

  function toggleTag(id) {
    const current = draft.tags || [];
    update("tags", current.includes(id) ? current.filter((tagId) => tagId !== id) : [...current, id]);
  }

  return (
    <section className="composer">
      <div className="composer-head">
        <h3>{isTask ? "Add task" : "Add note"}</h3>
        {!isTask && (
          <label className="pin-toggle">
            <input type="checkbox" checked={Boolean(noteDraft.isPinned)} onChange={(event) => update("isPinned", event.target.checked)} />
            Pin
          </label>
        )}
      </div>

      <input
        className="field"
        placeholder={isTask ? "Task title *" : "Note title *"}
        value={draft.title}
        onChange={(event) => update("title", event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && draft.title.trim()) onAdd();
        }}
      />

      <textarea
        className="textarea"
        placeholder={isTask ? "Task description" : "Note description"}
        value={draft.description ?? draft.text ?? ""}
        onChange={(event) => {
          const value = event.target.value;
          if (isTask) onTaskChange({ ...taskDraft, description: value, text: value });
          else onNoteChange({ ...noteDraft, description: value, text: value });
        }}
      />

      <div className="form-row">
        <select className="select" value={draft.priority || "normal"} onChange={(event) => update("priority", event.target.value)}>
          {PRIORITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label} priority</option>
          ))}
        </select>
        <select className="select" value={draft.status || "open"} onChange={(event) => update("status", event.target.value)}>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label className="field-label">
          Due date
          <input className="field" type="date" value={draft.dueDate || ""} onChange={(event) => update("dueDate", event.target.value)} />
        </label>
        <label className="field-label">
          Reminder
          <input className="field" type="time" value={draft.reminderTime || ""} onChange={(event) => update("reminderTime", event.target.value)} />
        </label>
      </div>

      <div className="form-row">
        <label className="field-label">
          Start date
          <input className="field" type="date" value={draft.startDate || ""} onChange={(event) => update("startDate", event.target.value)} />
        </label>
        <label className="field-label">
          Start time
          <input className="field" type="time" value={draft.startTime || draft.time || ""} onChange={(event) => {
            const value = event.target.value;
            if (isTask) onTaskChange({ ...taskDraft, startTime: value, time: value });
            else onNoteChange({ ...noteDraft, startTime: value, time: value });
          }} />
        </label>
      </div>

      <div className="form-row">
        <label className="field-label">
          Duration minutes
          <input className="field" type="number" min="0" value={draft.durationMinutes || ""} onChange={(event) => update("durationMinutes", event.target.value)} />
        </label>
        <label className="field-label">
          Parent task
          <select className="select" value={draft.parentId || ""} onChange={(event) => update("parentId", event.target.value)}>
            <option value="">None</option>
            {taskParents.map((task) => (
              <option key={task.id} value={task.id}>{task.title || "Untitled task"}</option>
            ))}
          </select>
        </label>
      </div>

      {tags.length > 0 && (
        <div className="field-block">
          <p className="field-title">Tags</p>
          <div className="tag-picker">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                className={`tag-pick-btn ${(draft.tags || []).includes(tag.id) ? "active" : ""}`}
                style={(draft.tags || []).includes(tag.id) ? { background: tag.color, color: "#fff", borderColor: tag.color } : { borderColor: `${tag.color}88`, color: tag.color }}
                onClick={() => toggleTag(tag.id)}
              >
                # {tag.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="field-block">
        <p className="field-title">Linked work</p>
        <EntityLinksPicker items={items} routines={routines} links={draft.links || []} onChange={(links) => update("links", links)} />
      </div>

      <button className="pill-btn primary" type="button" onClick={() => onAdd()} disabled={!draft.title.trim()}>
        {isTask ? "Add task" : "Save note"}
      </button>
    </section>
  );
}
