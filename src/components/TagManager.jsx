import { useState } from "react";

const PRESET_COLORS = ["#f45d8f", "#7c4dff", "#ff9d47", "#1fa97a", "#2196f3", "#e91e63", "#ff5722", "#607d8b"];

function createTagId() {
  return `tag-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function TagManager({ tags, onTagsChange, onClose }) {
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

  function addTag() {
    if (!newLabel.trim()) return;
    onTagsChange([...tags, { id: createTagId(), label: newLabel.trim(), color: newColor }]);
    setNewLabel("");
  }

  function deleteTag(id) {
    onTagsChange(tags.filter((t) => t.id !== id));
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Manage Tags</h3>
          <button className="icon-btn" type="button" onClick={onClose}>✕</button>
        </div>

        <div className="tag-list">
          {tags.length === 0 && <p className="muted" style={{ textAlign: "center" }}>No tags yet.</p>}
          {tags.map((tag) => (
            <div key={tag.id} className="tag-row">
              <span className="tag-dot" style={{ background: tag.color }} />
              <span className="tag-label">{tag.label}</span>
              <button className="delete" type="button" onClick={() => deleteTag(tag.id)}>✕</button>
            </div>
          ))}
        </div>

        <div className="tag-add-row">
          <input
            className="field"
            type="text"
            placeholder="Tag name"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTag()}
          />
          <div className="color-swatches">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`swatch ${newColor === c ? "active" : ""}`}
                style={{ background: c }}
                onClick={() => setNewColor(c)}
              />
            ))}
          </div>
          <button className="pill-btn primary" type="button" onClick={addTag}>Add</button>
        </div>
      </div>
    </div>
  );
}
