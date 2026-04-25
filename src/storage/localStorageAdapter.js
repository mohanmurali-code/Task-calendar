const storageKey = "task-calendar-v2";

export const localStorageAdapter = {
  loadItems() {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch {
      return [];
    }
  },

  saveItems(items) {
    localStorage.setItem(storageKey, JSON.stringify(items));
  },

  clearItems() {
    localStorage.removeItem(storageKey);
  },
};

export { storageKey };
