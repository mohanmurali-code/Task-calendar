const ITEMS_KEY = "task-calendar-v3";
const ITEMS_KEY_V2 = "task-calendar-v2";
const PROFILE_KEY = "task-calendar-profile";
const ROUTINES_KEY = "task-calendar-routines";
const TAGS_KEY = "task-calendar-tags";

function migrateV2ToV3(items) {
  return items.map((item) => ({
    ...item,
    tags: item.tags || [],
    isRoutine: item.isRoutine || false,
    routineId: item.routineId || null,
    color: item.color || null,
    isPinned: item.isPinned || false,
    updatedAt: item.updatedAt || item.createdAt,
    title: item.title || "",
  }));
}

export const localStorageAdapter = {
  // ── Items ──────────────────────────────────────────────
  loadItems() {
    try {
      const v3 = localStorage.getItem(ITEMS_KEY);
      if (v3) return JSON.parse(v3);

      // Migrate from v2
      const v2 = localStorage.getItem(ITEMS_KEY_V2);
      if (v2) {
        const migrated = migrateV2ToV3(JSON.parse(v2));
        localStorage.setItem(ITEMS_KEY, JSON.stringify(migrated));
        return migrated;
      }
      return [];
    } catch {
      return [];
    }
  },

  saveItems(items) {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  },

  clearItems() {
    localStorage.removeItem(ITEMS_KEY);
  },

  // ── Profile ────────────────────────────────────────────
  loadProfile() {
    try {
      return JSON.parse(localStorage.getItem(PROFILE_KEY)) || { name: "", initials: "ME", color: "#7c4dff" };
    } catch {
      return { name: "", initials: "ME", color: "#7c4dff" };
    }
  },

  saveProfile(profile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  },

  // ── Routines ───────────────────────────────────────────
  loadRoutines() {
    try {
      return JSON.parse(localStorage.getItem(ROUTINES_KEY)) || [];
    } catch {
      return [];
    }
  },

  saveRoutines(routines) {
    localStorage.setItem(ROUTINES_KEY, JSON.stringify(routines));
  },

  // ── Tags ───────────────────────────────────────────────
  loadTags() {
    try {
      return JSON.parse(localStorage.getItem(TAGS_KEY)) || [];
    } catch {
      return [];
    }
  },

  saveTags(tags) {
    localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
  },

  // ── Nuclear clear ──────────────────────────────────────
  clearAll() {
    [ITEMS_KEY, ITEMS_KEY_V2, PROFILE_KEY, ROUTINES_KEY, TAGS_KEY].forEach((k) =>
      localStorage.removeItem(k),
    );
  },
};

export { ITEMS_KEY };
