import { findLinkedEntity, normalizeLinks } from "../utils/entities.js";

export default function LinkedChips({ links, items, routines }) {
  const normalized = normalizeLinks(links);
  if (!normalized.length) return null;

  return (
    <>
      {normalized.map((link) => {
        const entity = findLinkedEntity(link, items, routines);
        const title = entity?.title || (link.kind === "note" ? "Untitled note" : "Untitled");
        return (
          <span key={`${link.kind}:${link.id}`} className="chip link-chip" title={`${link.kind}: ${title}`}>
            {link.kind}: {title}
          </span>
        );
      })}
    </>
  );
}
