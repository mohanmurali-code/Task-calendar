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
    days: Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      return {
        day,
        key: toDateKey(new Date(year, month, day)),
      };
    }),
  };
}

export function monthLabel(monthDate) {
  return monthDate.toLocaleDateString("en", { month: "long", year: "numeric" });
}
