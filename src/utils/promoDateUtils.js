// utils/promoWindow.ts
import { DateTime } from "luxon";

const QUEBEC_TZ = "America/Toronto";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function addToken(tokens, token) {
  if (typeof token === "string" && ISO_DATE_RE.test(token)) {
    tokens.add(token);
  }
}

function parseSlashDateToken(raw) {
  const m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;

  const first = parseInt(m[1], 10);
  const second = parseInt(m[2], 10);
  const year = parseInt(m[3], 10);

  // Default to dd/MM/yyyy for FR back-offices.
  let day = first;
  let month = second;

  // If the first number cannot be a day, read as MM/dd/yyyy.
  if (first > 31 || second > 12) {
    day = second;
    month = first;
  }

  const dt = DateTime.fromObject({ year, month, day }, { zone: QUEBEC_TZ });
  return dt.isValid ? dt.toISODate() : null;
}

/** Return date candidates as "YYYY-MM-DD" tokens from many possible input formats. */
function extractDateCandidates(dateLike) {
  const tokens = new Set();
  if (!dateLike) return [];

  if (typeof dateLike === "string") {
    const raw = dateLike.trim();
    if (!raw) return [];

    const isoPrefix = raw.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoPrefix) addToken(tokens, isoPrefix[1]);

    addToken(tokens, parseSlashDateToken(raw));

    const iso = DateTime.fromISO(raw, { setZone: true });
    if (iso.isValid) addToken(tokens, iso.setZone(QUEBEC_TZ).toISODate());

    const js = new Date(raw);
    if (!Number.isNaN(js.getTime())) {
      const dt = DateTime.fromJSDate(js, { zone: QUEBEC_TZ });
      addToken(tokens, dt.isValid ? dt.toISODate() : null);
    }

    return [...tokens];
  }

  if (dateLike?.toDate && typeof dateLike.toDate === "function") {
    const dt = DateTime.fromJSDate(dateLike.toDate(), { zone: QUEBEC_TZ });
    addToken(tokens, dt.isValid ? dt.toISODate() : null);
    return [...tokens];
  }

  if (dateLike instanceof Date) {
    const dt = DateTime.fromJSDate(dateLike, { zone: QUEBEC_TZ });
    addToken(tokens, dt.isValid ? dt.toISODate() : null);
    return [...tokens];
  }

  if (typeof dateLike === "number") {
    const dt = DateTime.fromMillis(dateLike, { zone: QUEBEC_TZ });
    addToken(tokens, dt.isValid ? dt.toISODate() : null);
    return [...tokens];
  }

  if (typeof dateLike === "object") {
    const seconds =
      typeof dateLike.seconds === "number"
        ? dateLike.seconds
        : typeof dateLike._seconds === "number"
        ? dateLike._seconds
        : null;
    if (seconds !== null) {
      const dt = DateTime.fromSeconds(seconds, { zone: QUEBEC_TZ });
      addToken(tokens, dt.isValid ? dt.toISODate() : null);
      return [...tokens];
    }
  }

  try {
    const dt = DateTime.fromJSDate(new Date(dateLike), { zone: QUEBEC_TZ });
    addToken(tokens, dt.isValid ? dt.toISODate() : null);
  } catch {
    // Ignore invalid values; caller will treat empty candidates as invalid.
  }

  return [...tokens];
}

function pickBoundaryToken(dateLike, boundary) {
  const candidates = extractDateCandidates(dateLike).sort();
  if (candidates.length === 0) return null;
  return boundary === "start"
    ? candidates[0]
    : candidates[candidates.length - 1];
}

/** Québec-local inclusive window: [start 00:00, end 23:59] — times on inputs ignored */
export function isActiveInQuebec_DateOnly_0000_to_2359(startLike, endLike) {
  // Earliest possible start + latest possible end prevents timezone false negatives.
  const startToken = pickBoundaryToken(startLike, "start");
  const endToken = pickBoundaryToken(endLike, "end");
  if (!startToken || !endToken) return false;

  const nowQc = DateTime.now().setZone(QUEBEC_TZ);

  const startBoundary = DateTime.fromISO(startToken, { zone: QUEBEC_TZ }).startOf(
    "day"
  );
  const endBoundary = DateTime.fromISO(endToken, { zone: QUEBEC_TZ }).endOf(
    "day"
  );

  if (!startBoundary.isValid || !endBoundary.isValid) return false;
  if (endBoundary < startBoundary) return false;

  return nowQc >= startBoundary && nowQc <= endBoundary;
}
