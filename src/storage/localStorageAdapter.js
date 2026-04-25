const ITEMS_KEY = "task-calendar-v3";
const ITEMS_KEY_V2 = "task-calendar-v2";
const PROFILE_KEY = "task-calendar-profile";
const ROUTINES_KEY = "task-calendar-routines";
const TAGS_KEY = "task-calendar-tags";

function migrateItem(item) {
  return {
    tags: [],
    isRoutine: false,
    routineId: null,
    color: null,
    isPinned: false,
    updatedAt: item.createdAt,
    title: "",
    pomodoroCount: 0,  // NEW — persisted session count
    ...item,
    pomodoroCount: item.pomodoroCount ?? 0,
  };
}

export const localStorageAdapter = {
  loadItems() {
    try {
      const v3 = localStorage.getItem(ITEMS_KEY);
      if (v3) {
        const parsed = JSON.parse(v3);
        // Ensure pomodoroCount exists on old v3 items
        return parsed.map((item) => ({ pomodoroCount: 0, ...item }));
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
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  },

  clearItems() { localStorage.removeItem(ITEMS_KEY); },

  loadProfile() {
    try {
      return JSON.parse(localStorage.getItem(PROFILE_KEY)) || { name: "", initials: "ME", color: "#7c4dff" };
    } catch { return { name: "", initials: "ME", color: "#7c4dff" }; }
  },

  saveProfile(p) { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); },

  loadRoutines() {
    try { return JSON.parse(localStorage.getItem(ROUTINES_KEY)) || []; }
    catch { return []; }
  },

  saveRoutines(r) { localStorage.setItem(ROUTINES_KEY, JSON.stringify(r)); },

  loadTags() {
    try { return JSON.parse(localStorage.getItem(TAGS_KEY)) || []; }
    catch { return []; }
  },

  saveTags(t) { localStorage.setItem(TAGS_KEY, JSON.stringify(t)); },

  clearAll() {
    [ITEMS_KEY, ITEMS_KEY_V2, PROFILE_KEY, ROUTINES_KEY, TAGS_KEY]
      .forEach((k) => localStorage.removeItem(k));
  },
};

export { ITEMS_KEY };
