// utils/promoWindow.ts
import { DateTime } from "luxon";

const QUEBEC_TZ = "America/Toronto";

/** Return "YYYY-MM-DD" token from Timestamp | Date | string | millis */
function extractDateToken(dateLike) {
  if (!dateLike) return null;

  // String: take first 10 chars if they look like a date
  if (typeof dateLike === "string") {
    const m = dateLike.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
    const dt = DateTime.fromISO(dateLike, { setZone: true }).setZone(QUEBEC_TZ);
    return dt.isValid ? dt.toISODate() : null;
  }

  // Firestore Timestamp
  if (dateLike?.toDate && typeof dateLike.toDate === "function") {
    const dt = DateTime.fromJSDate(dateLike.toDate(), { zone: QUEBEC_TZ });
    return dt.isValid ? dt.toISODate() : null;
  }

  // JS Date
  if (dateLike instanceof Date) {
    const dt = DateTime.fromJSDate(dateLike, { zone: QUEBEC_TZ });
    return dt.isValid ? dt.toISODate() : null;
  }

  // Millis
  if (typeof dateLike === "number") {
    const dt = DateTime.fromMillis(dateLike, { zone: QUEBEC_TZ });
    return dt.isValid ? dt.toISODate() : null;
  }

  // Fallback
  try {
    const dt = DateTime.fromJSDate(new Date(dateLike), { zone: QUEBEC_TZ });
    return dt.isValid ? dt.toISODate() : null;
  } catch {
    return null;
  }
}

/** Québec-local inclusive window: [start 00:00, end 23:59] — times on inputs ignored */
export function isActiveInQuebec_DateOnly_0000_to_2359(startLike, endLike) {
  const startToken = extractDateToken(startLike); // "YYYY-MM-DD"
  const endToken = extractDateToken(endLike);
  if (!startToken || !endToken) return false;

  const nowQc = DateTime.now().setZone(QUEBEC_TZ);

  // Start at 00:00:00.000
  const startBoundary = DateTime.fromISO(startToken, { zone: QUEBEC_TZ }).set({
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });

  // End at EXACTLY 23:59:00.000 (your requirement)
  const endBoundary = DateTime.fromISO(endToken, { zone: QUEBEC_TZ }).set({
    hour: 23,
    minute: 59,
    second: 0,
    millisecond: 0,
  });

  if (!startBoundary.isValid || !endBoundary.isValid) return false;
  if (endBoundary < startBoundary) return false;

  // Inclusive check (<= 23:59)
  return nowQc >= startBoundary && nowQc <= endBoundary;
}
