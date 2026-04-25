export function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromDateKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateKey(key, options) {
  return fromDateKey(key).toLocaleDateString("en", options);
}

export function buildMonthDays(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return {
    firstDay,
    days: Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return { day, key: toDateKey(new Date(year, month, day)) };
    }),
  };
}

export function monthLabel(monthDate) {
  return monthDate.toLocaleDateString("en", { month: "long", year: "numeric" });
}

/** Returns the Monday of the week containing `date` */
export function weekStart(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Returns array of 7 Date objects Mon–Sun for the week containing `date` */
export function weekDays(date) {
  const start = weekStart(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

/** Short weekday labels */
export const SHORT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Format like "Mon 25 Apr" */
export function shortDayLabel(date) {
  return date.toLocaleDateString("en", { weekday: "short", day: "numeric", month: "short" });
}
