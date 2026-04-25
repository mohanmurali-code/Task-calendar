import { useState } from "react";
import TagManager from "../components/TagManager.jsx";

const PRESET_COLORS = ["#7c4dff","#f45d8f","#ff9d47","#1fa97a","#2196f3","#e91e63","#ff5722","#607d8b"];

export default function ProfilePage({ profile, items, routines, tags, onProfileChange, onTagsChange, onClearAll }) {
  const [name, setName] = useState(profile.name || "");
  const [color, setColor] = useState(profile.color || "#7c4dff");
  const [confirmClear, setConfirmClear] = useState(false);
  const [showTagMgr, setShowTagMgr] = useState(false);

  function getInitials(n) {
    return n.trim() ? n.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "ME";
  }
  function save() { onProfileChange({ name, color, initials: getInitials(name) }); }

  const taskCount = items.filter((i) => i.type === "task").length;
  const doneCount = items.filter((i) => i.type === "task" && i.done).length;
  const noteCount = items.filter((i) => i.type === "note").length;
  const pomoTotal = items.reduce((sum, i) => sum + (i.pomodoroCount || 0), 0);
  const pct = taskCount > 0 ? Math.round((doneCount / taskCount) * 100) : 0;

  return (
    <div className="page profile-page">
      <div className="page-header">
        <h2 className="page-title">👤 Profile & Settings</h2>
      </div>

      <div className="profile-section">
        <h3 className="section-title">My Profile</h3>
        <div className="profile-edit-row">
          <div className="profile-avatar-preview" style={{ background: color }}>{getInitials(name)}</div>
          <div style={{ flex: 1, display: "grid", gap: 10 }}>
            <input className="field" type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            <div className="color-swatches">
              {PRESET_COLORS.map((c) => (
                <button key={c} type="button" className={`swatch ${color === c ? "active" : ""}`} style={{ background: c }} onClick={() => setColor(c)} />
              ))}
            </div>
            <button className="pill-btn primary" type="button" onClick={save}>Save Profile</button>
          </div>
        </div>
      </div>

      <div className="profile-section">
        <h3 className="section-title">Your Stats</h3>
        <div className="profile-stats-grid">
          <div className="profile-stat-card"><span className="profile-stat-value">{taskCount}</span><span className="muted">Total Tasks</span></div>
          <div className="profile-stat-card"><span className="profile-stat-value">{doneCount}</span><span className="muted">Completed</span></div>
          <div className="profile-stat-card"><span className="profile-stat-value">{pct}%</span><span className="muted">Done Rate</span></div>
          <div className="profile-stat-card"><span className="profile-stat-value">{noteCount}</span><span className="muted">Notes</span></div>
          <div className="profile-stat-card"><span className="profile-stat-value">{routines.length}</span><span className="muted">Routines</span></div>
          <div className="profile-stat-card"><span className="profile-stat-value">🍅 {pomoTotal}</span><span className="muted">Pomodoros</span></div>
        </div>
      </div>

      <div className="profile-section">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h3 className="section-title">Tags</h3>
          <button className="pill-btn" type="button" onClick={() => setShowTagMgr(true)}>Manage Tags</button>
        </div>
        <div className="tag-filter-row" style={{ marginTop: 10 }}>
          {tags.length === 0 && <p className="muted">No tags yet.</p>}
          {tags.map((tag) => (
            <span key={tag.id} className="chip tag-chip" style={{ color: tag.color, borderColor: tag.color+"55", background: tag.color+"18" }}># {tag.label}</span>
          ))}
        </div>
      </div>

      <div className="profile-section danger-zone">
        <h3 className="section-title" style={{ color:"#f44336" }}>Danger Zone</h3>
        {!confirmClear ? (
          <button className="pill-btn danger-btn" type="button" onClick={() => setConfirmClear(true)}>🗑 Clear all data</button>
        ) : (
          <div className="confirm-row">
            <p className="muted">This deletes ALL tasks, notes, routines and tags and cannot be undone.</p>
            <div style={{ display:"flex", gap:8, marginTop:8 }}>
              <button className="pill-btn danger-btn" type="button" onClick={onClearAll}>Yes, delete everything</button>
              <button className="pill-btn" type="button" onClick={() => setConfirmClear(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {showTagMgr && <TagManager tags={tags} onTagsChange={onTagsChange} onClose={() => setShowTagMgr(false)} />}
    </div>
  );
}
