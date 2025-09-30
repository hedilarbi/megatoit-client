import { db } from "@/lib/firebase";

import {
  doc,
  getDoc,
  collection,
  where,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

import { isNowWithinWindow } from "../utils/promoDateUtils";

export const getAllMatches = async () => {
  try {
    const matchsCollection = collection(db, "matchs");
    const today = new Date();
    const q = query(
      matchsCollection,
      where("date", ">=", today),
      orderBy("date", "asc")
    );
    const matchsSnapshot = await getDocs(q);
    const matchs = matchsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return { success: true, data: matchs };
  } catch (error) {
    console.error("Erreur lors de la récupération des matchs :", error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la récupération des matchs",
    };
  }
};

export const getAllMatchsList = async () => {
  try {
    const matchsCollection = collection(db, "matchs");

    const q = query(matchsCollection, orderBy("date", "asc"));
    const matchsSnapshot = await getDocs(q);
    const matchs = matchsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return { success: true, data: matchs };
  } catch (error) {
    console.error("Erreur lors de la récupération des matchs :", error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la récupération des matchs",
    };
  }
};

export const getMatchByUid = async (uid) => {
  try {
    const matchDoc = await getDoc(doc(db, "matchs", uid));

    return { success: true, data: matchDoc.data() };
  } catch (error) {
    console.error("Erreur lors de la récupération du match par UID :", error);
    return {
      success: false,
      error:
        "Une erreur s'est produite lors de la récupération du match par UID",
    };
  }
};

export const getMatchByTitle = async (title) => {
  try {
    const matchsCollection = collection(db, "matchs");
    const q = query(matchsCollection, where("title", "==", title));
    const matchsSnapshot = await getDocs(q);
    const matchs = matchsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return { success: true, data: matchs };
  } catch (error) {
    console.error("Erreur lors de la récupération du match par titre :", error);
    return {
      success: false,
      error:
        "Une erreur s'est produite lors de la récupération du match par titre",
    };
  }
};

export const getMatchById = async (id) => {
  try {
    const matchDoc = await getDoc(doc(db, "matchs", id));

    if (!matchDoc.exists()) {
      return { success: false, error: "Match not found" };
    }
    return { success: true, data: matchDoc.data() };
  } catch (error) {
    console.error("Erreur lors de la récupération du match par ID :", error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la récupération du match",
    };
  }
};

export const getOrderByIntent = async (paymentIntentId) => {
  try {
    const ordersCollection = collection(db, "orders");
    const q = query(
      ordersCollection,
      where("paymentIntentId", "==", paymentIntentId)
    );
    const ordersSnapshot = await getDocs(q);

    if (ordersSnapshot.empty) {
      return { success: false, error: "Order not found" };
    }

    const orderDoc = ordersSnapshot.docs[0];
    const orderData = orderDoc.data();

    if (orderData.matchId) {
      const matchDoc = await getDoc(doc(db, "matchs", orderData.matchId));
      if (matchDoc.exists()) {
        orderData.match = { id: matchDoc.id, ...matchDoc.data() };
      }
    }

    if (orderData.abonnementId) {
      const abonnementDoc = await getDoc(
        doc(db, "abonements", orderData.abonnementId)
      );
      if (abonnementDoc.exists()) {
        orderData.abonnement = {
          id: abonnementDoc.id,
          ...abonnementDoc.data(),
        };
      }
    }

    return { success: true, data: orderData };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la commande par PaymentIntent ID :",
      error
    );
    return {
      success: false,
      error: "Une erreur s'est produite lors de la récupération de la commande",
    };
  }
};

export const getOrderByUID = async (orderId) => {
  try {
    const orderDoc = await getDoc(doc(db, "orders", orderId));

    if (!orderDoc.exists()) {
      return { success: false, error: "Order not found" };
    }

    const orderData = orderDoc.data();

    if (orderData.matchId) {
      const matchDoc = await getDoc(doc(db, "matchs", orderData.matchId));
      if (matchDoc.exists()) {
        orderData.match = { id: matchDoc.id, ...matchDoc.data() };
      }
    }

    if (orderData.abonnementId) {
      const abonnementDoc = await getDoc(
        doc(db, "abonements", orderData.abonnementId)
      );
      if (abonnementDoc.exists()) {
        orderData.abonnement = {
          id: abonnementDoc.id,
          ...abonnementDoc.data(),
        };
      }
    }

    return { success: true, data: orderData };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la commande par PaymentIntent ID :",
      error
    );
    return {
      success: false,
      error: "Une erreur s'est produite lors de la récupération de la commande",
    };
  }
};

function getUserTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch (e) {
    console.error(
      "Erreur lors de la récupération du fuseau horaire de l'utilisateur :",
      e
    );
    return "UTC"; // SSR fallback
  }
}

export const verifyPromoCode = async (code, userId) => {
  try {
    const q = query(collection(db, "promoCodes"), where("code", "==", code));
    const snap = await getDocs(q);
    if (snap.empty) return { success: false, error: "Code promo non trouvé" };

    const promoCodeData = { id: snap.docs[0].id, ...snap.docs[0].data() };

    // Timezone-aware, inclusive day window
    const zone = getUserTimeZone(); // e.g., "America/Toronto" for Québec
    const active = isNowWithinWindow(
      promoCodeData.startDate,
      promoCodeData.endDate,
      zone
    );
    if (!active) return { success: false, error: "Code promo expiré" };

    if (
      promoCodeData.totalUsage &&
      (promoCodeData.used || 0) >= promoCodeData.totalUsage
    ) {
      return { success: false, error: "Code promo épuisé" };
    }

    const userSnap = await getDoc(doc(db, "users", userId));
    if (!userSnap.exists())
      return { success: false, error: "Utilisateur non trouvé" };

    const userData = userSnap.data();
    const used = userData?.usedPromoCodes?.find(
      (u) => u.promoCode === promoCodeData.id
    );
    if (
      used &&
      typeof promoCodeData.usagePerUser === "number" &&
      (used.numberOfUses || 0) >= promoCodeData.usagePerUser
    ) {
      return { success: false, error: "Code promo déjà utilisé" };
    }

    return { success: true, data: promoCodeData };
  } catch (e) {
    console.error("Erreur lors de la vérification du code promo :", e);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la vérification du code promo",
    };
  }
};
