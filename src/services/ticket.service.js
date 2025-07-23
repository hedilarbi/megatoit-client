import admin from "@/lib/firebaseAdmin";

import QRCode from "qrcode";
import { getStorage } from "firebase-admin/storage";
import crypto from "crypto";
export const createTicketAndOrder = async ({
  userId,
  matchId,
  quantity,
  ticketPrice,
  amount,
  abonnementPrice,
  abonnementId,
  paymentIntentId,
}) => {
  try {
    const orderRef = admin.firestore().collection("orders").doc();
    let order = null;
    console.log(matchId);
    if (matchId && quantity && ticketPrice) {
      const buffer = crypto.randomBytes(Math.ceil(8 / 2));
      const code = buffer.toString("hex").slice(0, 10);
      order = {
        userId,
        matchId,
        quantity,
        code,
        ticketPrice,
        amount,
        paymentIntentId,
        paiement_status: true,
        tickets: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
    }
    if (abonnementId && abonnementPrice) {
      const buffer = crypto.randomBytes(Math.ceil(8 / 2));
      const code = buffer.toString("hex").slice(0, 10);
      order = {
        userId,
        code,
        abonnementId,
        abonnementPrice,
        amount,
        paymentIntentId,
        subscriptionId: "",
        paiement_status: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
    }

    // Retrieve the newly created order ID
    const orderId = orderRef.id;

    let tickets = [];
    if (matchId) {
      for (let i = 0; i < quantity; i++) {
        const ticketRef = admin.firestore().collection("tickets").doc();
        const ticketId = ticketRef.id;
        order.tickets.push(ticketId);

        const qrImageBuffer = await QRCode.toBuffer(ticketId, {
          errorCorrectionLevel: "H",
          type: "png",
          width: 300,
          margin: 1,
        });
        const bucket = getStorage().bucket();
        const file = bucket.file(`qrcodes/${ticketId}.png`);
        await file.save(qrImageBuffer, {
          metadata: {
            contentType: "image/png",
          },
        });

        // Rends-le public (ou utilise signed URL si privé)
        await file.makePublic();
        const qrCodeURL = file.publicUrl();
        const buffer = crypto.randomBytes(Math.ceil(8 / 2));
        const code = buffer.toString("hex").slice(0, 10);
        const ticket = {
          userId,
          matchId,
          orderId,
          price: ticketPrice,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          isUsed: false,
          TicketCode: code, // Generate a unique ticket code
          qrCodeURL,
        };
        await ticketRef.set(ticket);
        tickets.push({
          ...ticket,
          qrCodeImage: qrImageBuffer,
        });
      }
      const matchRef = admin.firestore().collection("matchs").doc(matchId);
      const matchDoc = await matchRef.get();

      if (!matchDoc.exists) {
        throw new Error("Match not found");
      }

      const matchData = matchDoc.data();
      if (matchData.availableSeats < quantity) {
        throw new Error("Not enough available seats");
      }

      await matchRef.update({
        availableSeats: matchData.availableSeats - quantity,
      });
    }
    let abonnement = null;
    if (abonnementId) {
      const subscriptionRef = admin
        .firestore()
        .collection("subscriptions")
        .doc();
      const subscriptionId = subscriptionRef.id;
      order.subscriptionId = subscriptionId;
      const qrImageBuffer = await QRCode.toBuffer(subscriptionId, {
        errorCorrectionLevel: "H",
        type: "png",
        width: 300,
        margin: 1,
      });
      const bucket = getStorage().bucket();
      const file = bucket.file(`qrcodes/${subscriptionId}.png`);
      await file.save(qrImageBuffer, {
        metadata: {
          contentType: "image/png",
        },
      });

      // Rends-le public (ou utilise signed URL si privé)
      await file.makePublic();
      const qrCodeURL = file.publicUrl();
      const buffer = crypto.randomBytes(Math.ceil(8 / 2));
      const code = buffer.toString("hex").slice(0, 10);
      const subscription = {
        userId,
        abonnementId,
        orderId,
        qrCodeURL,
        code,
        price: abonnementPrice,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true,
      };
      await subscriptionRef.set(subscription);
      abonnement = {
        ...subscription,
        qrCodeImage: qrImageBuffer,
      };
    }
    await orderRef.set(order);
    return {
      success: true,
      data: {
        tickets,
        abonnement,
        order,
      },
    };
  } catch (error) {
    console.error("Error creating ticket and order:", error);
    throw new Error("Failed to create ticket and order");
  }
};

export const getUserDocument = async (id) => {
  try {
    const userRef = admin.firestore().collection("users").doc(id);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new Error("User not found");
    }
    return userDoc.data();
  } catch (error) {
    console.error("Error fetching user document:", error);
    throw new Error("Failed to fetch user document");
  }
};

export const getOrderByIntent = async (paymentIntentId) => {
  try {
    const ordersRef = admin.firestore().collection("orders");
    const querySnapshot = await ordersRef
      .where("paymentIntentId", "==", paymentIntentId)
      .get();

    if (querySnapshot.empty) {
      throw new Error("Order not found");
    }

    const order = querySnapshot.docs[0].data();
    return order;
  } catch (error) {
    console.error("Error fetching order by payment intent:", error);
    //throw new Error("Failed to fetch order by payment intent");
  }
};

export const getMatchById = async (matchId) => {
  try {
    const matchRef = admin.firestore().collection("matchs").doc(matchId);
    const matchDoc = await matchRef.get();

    if (!matchDoc.exists) {
      throw new Error("Match not found");
    }

    return matchDoc.data();
  } catch (error) {
    console.error("Error fetching match by ID:", error);
    throw new Error("Failed to fetch match by ID");
  }
};

export const getAbonnementById = async (abonnementId) => {
  try {
    const abonnementRef = admin
      .firestore()
      .collection("subscriptions")
      .doc(abonnementId);
    const abonnementDoc = await abonnementRef.get();

    if (!abonnementDoc.exists) {
      throw new Error("Abonnement not found");
    }

    return abonnementDoc.data();
  } catch (error) {
    console.error("Error fetching abonnement by ID:", error);
    throw new Error("Failed to fetch abonnement by ID");
  }
};

export const updateTicketDownLoadUrl = async (ticketCode, downloadUrl) => {
  try {
    const ticketsRef = admin.firestore().collection("tickets");
    const querySnapshot = await ticketsRef
      .where("TicketCode", "==", ticketCode)
      .get();

    if (querySnapshot.empty) {
      throw new Error("Ticket not found");
    }

    const ticketRef = querySnapshot.docs[0].ref;

    await ticketRef.update({ downloadUrl });
    return { success: true };
  } catch (error) {
    console.error("Error updating download URL:", error);
    throw new Error("Failed to update download URL");
  }
};

export const updateSubscriptionDownloadUrl = async (
  subscriptionCode,
  downloadUrl
) => {
  try {
    const subscriptionsRef = admin.firestore().collection("subscriptions");
    const querySnapshot = await subscriptionsRef
      .where("code", "==", subscriptionCode)
      .get();

    if (querySnapshot.empty) {
      throw new Error("Subscription not found");
    }

    const subscriptionRef = querySnapshot.docs[0].ref;
    await subscriptionRef.update({ downloadUrl });
    return { success: true };
  } catch (error) {
    console.error("Error updating subscription download URL:", error);
    throw new Error("Failed to update subscription download URL");
  }
};
