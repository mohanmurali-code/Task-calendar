import { allLinkTargets, linkKey, normalizeLinks } from "../utils/entities.js";

export default function EntityLinksPicker({ items, routines, links, onChange, currentEntity }) {
  const normalizedLinks = normalizeLinks(links);
  const selected = new Set(normalizedLinks.map(linkKey));
  const targets = allLinkTargets(items, routines, currentEntity);

  function toggle(target) {
    const next = selected.has(linkKey(target))
      ? normalizedLinks.filter((link) => linkKey(link) !== linkKey(target))
      : normalizeLinks([...normalizedLinks, { kind: target.kind, id: target.id }]);
    onChange(next);
  }

  if (!targets.length) {
    return <p className="muted field-help">Create more tasks, notes, or routines to link related work.</p>;
  }

  return (
    <div className="link-picker">
      {targets.map((target) => (
        <button
          key={linkKey(target)}
          type="button"
          className={`link-pick-btn ${selected.has(linkKey(target)) ? "active" : ""}`}
          onClick={() => toggle(target)}
        >
          <span className="link-kind">{target.kind}</span>
          <span>{target.title}</span>
        </button>
      ))}
    </div>
  );
}
