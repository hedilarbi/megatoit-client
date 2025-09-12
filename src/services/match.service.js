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

export const verifyPromoCode = async (code, userId) => {
  try {
    const promoCodesCollection = collection(db, "promoCodes");
    const q = query(promoCodesCollection, where("code", "==", code));
    const promoCodesSnapshot = await getDocs(q);
    if (promoCodesSnapshot.empty) {
      return { success: false, error: "Code promo non trouvé" };
    }

    const promoCodeData = {
      id: promoCodesSnapshot.docs[0].id,
      ...promoCodesSnapshot.docs[0].data(),
    };

    const currentDate = new Date();
    if (
      promoCodeData.startDate > currentDate ||
      promoCodeData.endDate < currentDate
    ) {
      return { success: false, error: "Code promo expiré" };
    }

    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) {
      return { success: false, error: "Utilisateur non trouvé" };
    }
    const userData = userDoc.data();

    const usedPromoCode = userData?.usedPromoCodes?.find(
      (usedCode) => usedCode.promoCode === promoCodeData.id
    );
    if (usedPromoCode) {
      if (
        typeof promoCodeData.usagePerUser === "number" &&
        usedPromoCode.numberOfUses >= promoCodeData.usagePerUser
      ) {
        return { success: false, error: "Code promo déjà utilisé" };
      }
    }

    return { success: true, data: promoCodeData };
  } catch (error) {
    console.error("Erreur lors de la vérification du code promo :", error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la vérification du code promo",
    };
  }
};
