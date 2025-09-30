import { DateTime } from "luxon";

// Convert many shapes (ISO string, Firestore Timestamp, JS Date) to Luxon in a zone
export function toDateTimeInZone(dateLike, zone) {
  if (!dateLike) return null;

  if (typeof dateLike === "string") {
    // ISO strings: with Z or offset => absolute instant. Without time => date-only.
    const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateLike);
    return isDateOnly
      ? DateTime.fromISO(dateLike, { zone }) // interpret as local calendar date
      : DateTime.fromISO(dateLike).setZone(zone); // convert instant to zone
  }

  if (dateLike && typeof dateLike.toDate === "function") {
    return DateTime.fromJSDate(dateLike.toDate(), { zone });
  }

  if (dateLike && typeof dateLike.seconds === "number") {
    const ms =
      dateLike.seconds * 1000 + Math.floor((dateLike.nanoseconds || 0) / 1e6);
    return DateTime.fromMillis(ms, { zone });
  }

  if (dateLike instanceof Date) {
    return DateTime.fromJSDate(dateLike, { zone });
  }

  return null;
}

// Build inclusive local-day window for [startDate, endDate]
export function buildLocalWindow(startDateLike, endDateLike, zone) {
  const startDT = toDateTimeInZone(startDateLike, zone);
  const endDT = toDateTimeInZone(endDateLike, zone);
  if (!startDT || !endDT || !startDT.isValid || !endDT.isValid) {
    return { start: null, end: null };
  }

  const start = DateTime.fromObject(
    { year: startDT.year, month: startDT.month, day: startDT.day },
    { zone }
  ).startOf("day");

  const end = DateTime.fromObject(
    { year: endDT.year, month: endDT.month, day: endDT.day },
    { zone }
  ).endOf("day"); // 23:59:59.999

  return { start, end };
}

export function isNowWithinWindow(startDateLike, endDateLike, zone) {
  const { start, end } = buildLocalWindow(startDateLike, endDateLike, zone);
  if (!start || !end) return false;
  const now = DateTime.now().setZone(zone);
  return now >= start && now <= end;
}
