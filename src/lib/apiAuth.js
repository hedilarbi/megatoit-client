import admin from "./firebaseAdmin";

/**
 * Vérifie le jeton Firebase envoyé dans le header Authorization: Bearer ...
 * Renvoie le jeton décodé, ou null s'il est absent ou invalide.
 */
export async function verifyBearerToken(request) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;

  try {
    return await admin.auth().verifyIdToken(token);
  } catch {
    return null;
  }
}

/** Le compte a-t-il le type "admin" dans Firestore ? */
export async function isAdminUser(uid) {
  const snapshot = await admin.firestore().collection("users").doc(uid).get();
  return snapshot.exists && snapshot.data()?.type === "admin";
}

/** Première adresse IP du client (Vercel renseigne x-forwarded-for). */
export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for") || "";
  return (
    forwarded.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Limite de débit partagée entre toutes les instances (stockée dans Firestore).
 * `limits` : [{ key, max }] — chaque clé compte ses appels sur la même fenêtre.
 * Renvoie true si l'appel est autorisé.
 */
export async function consumeRateLimit(limits, windowMs) {
  const db = admin.firestore();
  const now = Date.now();
  const refs = limits.map(({ key }) =>
    db.collection("rateLimits").doc(key.replace(/[\/.#$[\]]/g, "_"))
  );

  return db.runTransaction(async (tx) => {
    const snapshots = await Promise.all(refs.map((ref) => tx.get(ref)));
    const next = snapshots.map((snap) => {
      const data = snap.exists ? snap.data() : null;
      const fresh = !data || now - data.windowStart >= windowMs;
      return fresh
        ? { windowStart: now, count: 1 }
        : { windowStart: data.windowStart, count: data.count + 1 };
    });

    if (next.some((entry, i) => entry.count > limits[i].max)) return false;

    next.forEach((entry, i) =>
      tx.set(refs[i], {
        ...entry,
        expiresAt: admin.firestore.Timestamp.fromMillis(entry.windowStart + windowMs),
      })
    );
    return true;
  });
}
