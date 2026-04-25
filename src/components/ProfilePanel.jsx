import { useState } from "react";

const PRESET_COLORS = ["#7c4dff", "#f45d8f", "#ff9d47", "#1fa97a", "#2196f3", "#e91e63", "#ff5722", "#607d8b"];

export default function ProfilePanel({ profile, onProfileChange, onClearAll, onClose }) {
  const [name, setName] = useState(profile.name || "");
  const [color, setColor] = useState(profile.color || "#7c4dff");
  const [confirmClear, setConfirmClear] = useState(false);

  function getInitials(n) {
    return n.trim()
      ? n.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
      : "ME";
  }

  function save() {
    onProfileChange({ name, color, initials: getInitials(name) });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>👤 Profile</h3>
          <button className="icon-btn" type="button" onClick={onClose}>✕</button>
        </div>

        <div className="profile-avatar-preview" style={{ background: color }}>
          {getInitials(name)}
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <input
            className="field"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div>
            <p className="muted" style={{ marginBottom: 8, fontSize: 12 }}>Avatar colour</p>
            <div className="color-swatches">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`swatch ${color === c ? "active" : ""}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
        </div>

        <button className="pill-btn primary" type="button" onClick={save} style={{ width: "100%" }}>
          Save Profile
        </button>

        <div className="danger-zone">
          {!confirmClear ? (
            <button className="pill-btn danger-btn" type="button" onClick={() => setConfirmClear(true)}>
              🗑 Clear all data
            </button>
          ) : (
            <div className="confirm-row">
              <p className="muted">Are you sure? This cannot be undone.</p>
              <button className="pill-btn danger-btn" type="button" onClick={onClearAll}>Yes, delete everything</button>
              <button className="pill-btn" type="button" onClick={() => setConfirmClear(false)}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
