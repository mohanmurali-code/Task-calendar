import { useState } from "react";

export default function LinkDialog({ items, routines, currentItem, onClose, onLink }) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("task"); // "task" | "note" | "routine"

  // Exclude the current item and items already linked
  const availableItems = items.filter(
    (i) => i.id !== currentItem.id && !(currentItem.links || []).includes(i.id)
  );
  
  const availableRoutines = routines.filter(
    (r) => r.id !== currentItem.id && !(currentItem.links || []).includes(r.id)
  );

  const filtered = activeTab === "routine" 
    ? availableRoutines.filter(r => r.title.toLowerCase().includes(search.toLowerCase()))
    : availableItems.filter(i => i.type === activeTab && (i.title || i.description || i.text || "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card link-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Link to {currentItem.type === "task" ? "Task" : currentItem.type === "note" ? "Note" : "Routine"}</h3>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="tabs" style={{ marginBottom: "16px" }}>
          <button className={`tab-btn ${activeTab === "task" ? "active" : ""}`} onClick={() => setActiveTab("task")}>Tasks</button>
          <button className={`tab-btn ${activeTab === "note" ? "active" : ""}`} onClick={() => setActiveTab("note")}>Notes</button>
          <button className={`tab-btn ${activeTab === "routine" ? "active" : ""}`} onClick={() => setActiveTab("routine")}>Routines</button>
        </div>

        <input 
          className="field" 
          placeholder={`Search ${activeTab}s...`} 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          autoFocus
        />

        <div className="link-list" style={{ maxHeight: "300px", overflowY: "auto", marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {filtered.length === 0 && <p className="muted" style={{ textAlign: "center", padding: "20px" }}>No {activeTab}s found.</p>}
          {filtered.map(item => (
            <div key={item.id} className="link-list-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", border: "1px solid var(--line)", borderRadius: "12px", cursor: "pointer" }} onClick={() => onLink(item.id)}>
              <div>
                <div style={{ fontWeight: "600" }}>{item.title || (activeTab === "note" ? "Untitled Note" : "Untitled")}</div>
                <div className="muted" style={{ fontSize: "12px", marginTop: "4px" }}>
                  {item.startDate || item.date || ""} {(item.tags || []).length > 0 ? `• ${(item.tags || []).length} tags` : ""}
                </div>
              </div>
              <button className="pill-btn" style={{ padding: "4px 12px", minHeight: "auto" }}>Link</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
