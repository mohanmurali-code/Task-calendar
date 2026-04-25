export const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "blocked", label: "Blocked" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
];

export function createDraftDefaults(overrides = {}) {
  return {
    title: "",
    description: "",
    text: "",
    priority: "normal",
    status: "open",
    dueDate: "",
    reminderTime: "",
    startDate: "",
    startTime: "",
    durationMinutes: "",
    completionTime: "",
    parentId: "",
    tags: [],
    links: [],
    ...overrides,
  };
}

export function entityKind(entity) {
  return entity?.type === "routine" || entity?.daysOfWeek ? "routine" : entity?.type || "task";
}

export function createEntityLink(entity) {
  return {
    kind: entityKind(entity),
    id: entity.id,
  };
}

export function linkKey(link) {
  return `${link.kind}:${link.id}`;
}

export function normalizeLinks(links = []) {
  const seen = new Set();
  return links
    .filter((link) => link?.kind && link?.id)
    .filter((link) => {
      const key = linkKey(link);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function isSameEntity(link, entity) {
  return link.kind === entityKind(entity) && link.id === entity.id;
}

export function entityTitle(entity) {
  if (!entity) return "Unknown";
  if (entity.title) return entity.title;
  if (entity.type === "note") return "Untitled note";
  return "Untitled";
}

export function allLinkTargets(items, routines, currentEntity) {
  const currentLink = currentEntity?.id ? createEntityLink(currentEntity) : null;
  return [
    ...items.map((item) => ({ ...createEntityLink(item), title: entityTitle(item) })),
    ...routines.map((routine) => ({ kind: "routine", id: routine.id, title: entityTitle(routine) })),
  ].filter((link) => !currentLink || linkKey(link) !== linkKey(currentLink));
}

export function findLinkedEntity(link, items, routines) {
  if (link.kind === "routine") return routines.find((routine) => routine.id === link.id);
  return items.find((item) => item.id === link.id && item.type === link.kind);
}

export function hasCompletedStatus(item) {
  return item.done || item.status === "completed";
}
