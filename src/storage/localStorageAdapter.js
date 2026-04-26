const ITEMS_KEY = "task-calendar-v4";
const ITEMS_KEY_V3 = "task-calendar-v3";
const ITEMS_KEY_V2 = "task-calendar-v2";
const PROFILE_KEY = "task-calendar-profile";
const ROUTINES_KEY = "task-calendar-routines";
const TAGS_KEY = "task-calendar-tags";

function migrateItem(item) {
  return {
    tags: [],
    links: [], // array of linked entity IDs
    description: item.text || item.description || "",
    status: item.done ? "completed" : "open",
    dueDate: item.dueDate || "",
    reminderTime: item.reminderTime || "",
    startDate: item.date || item.startDate || "",
    startTime: item.time || item.startTime || "",
    completionTime: item.completionTime || "",
    durationMinutes: item.durationMinutes || "",
    parentId: item.parentId || "",
    timeTracking: item.timeTracking || { totalSeconds: 0, lastStartedAt: null },
    isRoutine: item.isRoutine || false,
    routineId: item.routineId || null,
    color: item.color || null,
    isPinned: item.isPinned || false,
    updatedAt: item.updatedAt || item.createdAt || Date.now(),
    createdAt: item.createdAt || Date.now(),
    title: item.title || "",
    pomodoroCount: item.pomodoroCount ?? 0,
    type: item.type || "task",
    done: item.done || false,
    priority: item.priority || "normal",
    id: item.id
  };
}

export const localStorageAdapter = {
  loadItems() {
    try {
      const v4 = localStorage.getItem(ITEMS_KEY);
      if (v4) {
        return JSON.parse(v4).map(migrateItem);
      }
      const v3 = localStorage.getItem(ITEMS_KEY_V3);
      if (v3) {
        const migrated = JSON.parse(v3).map(migrateItem);
        localStorage.setItem(ITEMS_KEY, JSON.stringify(migrated));
        return migrated;
      }
      const v2 = localStorage.getItem(ITEMS_KEY_V2);
      if (v2) {
        const migrated = JSON.parse(v2).map(migrateItem);
        localStorage.setItem(ITEMS_KEY, JSON.stringify(migrated));
        return migrated;
      }
      return [];
    } catch { return []; }
  },

  saveItems(items) {
    try {
      localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
      return true;
    } catch {
      return false;
    }
  },

  clearItems() { localStorage.removeItem(ITEMS_KEY); },

  loadProfile() {
    try {
      return { name: "", initials: "ME", color: "#7c4dff", tags: [], ...(JSON.parse(localStorage.getItem(PROFILE_KEY)) || {}) };
    } catch { return { name: "", initials: "ME", color: "#7c4dff", tags: [] }; }
  },

  saveProfile(p) { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); },

  loadRoutines() {
    try { return (JSON.parse(localStorage.getItem(ROUTINES_KEY)) || []); }
    catch { return []; }
  },

  saveRoutines(r) { localStorage.setItem(ROUTINES_KEY, JSON.stringify(r)); },

  loadTags() {
    try { return JSON.parse(localStorage.getItem(TAGS_KEY)) || []; }
    catch { return []; }
  },

  saveTags(t) { localStorage.setItem(TAGS_KEY, JSON.stringify(t)); },

  clearAll() {
    [ITEMS_KEY, ITEMS_KEY_V3, ITEMS_KEY_V2, PROFILE_KEY, ROUTINES_KEY, TAGS_KEY]
      .forEach((k) => localStorage.removeItem(k));
  },
};

export { ITEMS_KEY };
