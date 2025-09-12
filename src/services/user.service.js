import { db } from "@/lib/firebase";

import {
  doc,
  setDoc,
  getDoc,
  collection,
  where,
  getDocs,
  query,
} from "firebase/firestore";

export const getUserDocument = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));

    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting user document:", error);
    throw error;
  }
};

export const createUserDocument = async (uid, userData) => {
  try {
    const usersRef = collection(db, "users");
    const emailQuery = query(usersRef, where("email", "==", userData.email));
    const querySnapshot = await getDocs(emailQuery);

    if (!querySnapshot.empty) {
      return;
    }
    await setDoc(doc(db, "users", uid), { ...userData, uid });
  } catch (error) {
    console.error("Error creating user document:", error);
    throw error;
  }
};

export const getUserOrders = async (uid) => {
  try {
    const ordersRef = collection(db, "orders");
    const ordersQuery = query(ordersRef, where("userId", "==", uid));
    const ordersSnapshot = await getDocs(ordersQuery);

    const orders = await Promise.all(
      ordersSnapshot.docs.map(async (orderDoc) => {
        const orderData = orderDoc.data();
        if (orderData.matchId) {
          const matchDoc = await getDoc(doc(db, "matchs", orderData.matchId));
          const matchData = matchDoc.exists() ? matchDoc.data() : null;

          return {
            id: orderDoc.id,
            ...orderData,
            match: matchData,
          };
        }
        if (orderData.subscriptionId) {
          const subscriptiontDoc = await getDoc(
            doc(db, "subscriptions", orderData.subscriptionId)
          );
          const subscriptionData = subscriptiontDoc.exists()
            ? subscriptiontDoc.data()
            : null;
          const abonnementDoc = await getDoc(
            doc(db, "abonements", orderData.abonnementId)
          );
          const abonnementData = abonnementDoc.exists()
            ? abonnementDoc.data()
            : null;

          return {
            id: orderDoc.id,
            ...orderData,
            subscription: subscriptionData,
            abonnement: abonnementData,
          };
        }
        // If neither matchId nor subscriptionId, just return the order data
        return {
          id: orderDoc.id,
          ...orderData,
        };
      })
    );

    // Sort by createdAt descending (newest first)
    orders.sort((a, b) => {
      const aTime = a.createdAt?.toMillis
        ? a.createdAt.toMillis()
        : a.createdAt || 0;
      const bTime = b.createdAt?.toMillis
        ? b.createdAt.toMillis()
        : b.createdAt || 0;
      return bTime - aTime;
    });

    return orders;
  } catch (error) {
    console.error("Error getting user orders:", error);
    throw error;
  }
};

export const getOrderById = async (id) => {
  try {
    const orderDoc = await getDoc(doc(db, "orders", id));
    if (orderDoc.exists()) {
      const orderData = orderDoc.data();
      if (orderData.matchId) {
        const matchDoc = await getDoc(doc(db, "matchs", orderData.matchId));
        if (matchDoc.exists()) {
          orderData.match = { id: matchDoc.id, ...matchDoc.data() };
        }
      }
      if (orderData.promoCodeId) {
        const promoCodeDoc = await getDoc(
          doc(db, "promoCodes", orderData.promoCodeId)
        );
        if (promoCodeDoc.exists()) {
          orderData.promoCode = {
            id: promoCodeDoc.id,
            ...promoCodeDoc.data(),
          };
        }
      }
      if (orderData.tickets) {
        const tickets = await Promise.all(
          orderData.tickets.map(async (ticketId) => {
            const ticketDoc = await getDoc(doc(db, "tickets", ticketId));
            if (ticketDoc.exists()) {
              return { id: ticketDoc.id, ...ticketDoc.data() };
            }
            return null;
          })
        );
        orderData.tickets = tickets.filter((ticket) => ticket !== null);
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
      if (orderData.subscriptionId) {
        const subscriptionDoc = await getDoc(
          doc(db, "subscriptions", orderData.subscriptionId)
        );
        if (subscriptionDoc.exists()) {
          orderData.subscription = {
            id: subscriptionDoc.id,
            ...subscriptionDoc.data(),
          };
        }
      }

      return { success: true, data: { id: orderDoc.id, ...orderData } };
    } else {
      return { success: false, error: "Order not found" };
    }
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    return { success: false, error: "Failed to fetch order by ID" };
  }
};
