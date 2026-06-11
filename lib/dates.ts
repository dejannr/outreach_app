import { endOfDay, format, isSameDay, startOfDay } from "date-fns";

export function getTodayWindow(referenceDate = new Date()) {
  return {
    start: startOfDay(referenceDate),
    end: endOfDay(referenceDate),
  };
}

export function isDueToday(date: Date, referenceDate = new Date()) {
  return isSameDay(date, referenceDate);
}

export function isOverdue(date: Date, referenceDate = new Date()) {
  return date < startOfDay(referenceDate);
}

export function formatDateTime(date?: Date | null) {
  if (!date) {
    return "Not scheduled";
  }

  return format(date, "dd MMM yyyy, HH:mm");
}
