import admin from "@/lib/firebaseAdmin";
import {
  createTicketAndOrder,
  findOrderByPaymentIntentId,
  getUserDocument,
} from "@/services/ticket.service";
import { generateAndSendTicketPDF } from "@/utils/generateAndSendTicketPDF";

const updatePromoCodeUsage = async ({ userRef, userDoc, promoCodeId }) => {
  if (!promoCodeId) return;
  const promoCodeRef = admin.firestore().collection("promoCodes").doc(promoCodeId);
  const promoCodeDoc = await promoCodeRef.get();
  if (!promoCodeDoc.exists) throw new Error(`Promo code not found: ${promoCodeId}`);

  const usedPromoCodes = userDoc.data().usedPromoCodes || [];
  const index = usedPromoCodes.findIndex((item) => item.promoCode === promoCodeId);
  if (index !== -1) usedPromoCodes[index].numberOfUses += 1;
  else usedPromoCodes.push({ promoCode: promoCodeId, numberOfUses: 1 });

  await promoCodeRef.update({ used: admin.firestore.FieldValue.increment(1) });
  await userRef.update({ usedPromoCodes });
};

const isAlreadyExistsError = (error) =>
  error?.code === 6 || error?.code === "already-exists" ||
  /already exists/i.test(error?.message || "");

const acquirePaymentIntentLock = async (paymentIntentId, sourceId, allowStaleRetry = true) => {
  const ref = admin.firestore().collection("payment_intent_locks").doc(paymentIntentId);
  try {
    await ref.create({
      paymentIntentId,
      sourceId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { acquired: true, ref };
  } catch (error) {
    if (isAlreadyExistsError(error)) {
      // Older code could leave the lock behind when fulfillment failed before
      // creating an order. Reclaim only old locks, never an active request.
      if (allowStaleRetry) {
        const snapshot = await ref.get();
        const createdAt = snapshot.data()?.createdAt?.toMillis?.();
        const isStale = !createdAt || Date.now() - createdAt > 5 * 60 * 1000;
        if (isStale) {
          await ref.delete();
          return acquirePaymentIntentLock(paymentIntentId, sourceId, false);
        }
      }
      return { acquired: false, ref };
    }
    throw error;
  }
};

// Shared by the webhook and the status endpoint, so a successful payment can
// recover even when the production webhook is delayed or missed.
export const fulfillSuccessfulPaymentIntent = async (paymentIntent, sourceId) => {
  if (!paymentIntent?.id || paymentIntent.status !== "succeeded") {
    throw new Error("PaymentIntent is not successful");
  }

  const existingOrder = await findOrderByPaymentIntentId(paymentIntent.id);
  if (existingOrder) {
    return { state: "fulfilled", orderId: existingOrder.id, duplicate: true };
  }

  const lock = await acquirePaymentIntentLock(
    paymentIntent.id,
    sourceId || `recovery_${paymentIntent.id}`
  );
  if (!lock.acquired) {
    const order = await findOrderByPaymentIntentId(paymentIntent.id);
    return order
      ? { state: "fulfilled", orderId: order.id, duplicate: true }
      : { state: "processing", orderId: null, duplicate: true };
  }

  try {
    const metadata = paymentIntent.metadata || {};
    const userId = metadata.userId;
    const matchId = metadata.matchId;
    const abonnementId = metadata.abonnementId;
    const ticketPrice = metadata.ticketPrice;
    const abonnementPrice = metadata.abonnementPrice;
    const promoCodeId = metadata.codeId || null;
    const quantity = Number.parseInt(metadata.quantity || "1", 10);

    if (!userId) throw new Error("Missing userId in PaymentIntent metadata");
    if (!matchId && !abonnementId) throw new Error("Missing purchase metadata in PaymentIntent");

    const userRef = admin.firestore().collection("users").doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) throw new Error(`User not found: ${userId}`);

    let response;
    if (matchId && Number.isInteger(quantity) && quantity > 0 && ticketPrice) {
      response = await createTicketAndOrder({
        userId, matchId, quantity,
        ticketPrice: Number.parseFloat(ticketPrice),
        amount: paymentIntent.amount,
        paymentIntentId: paymentIntent.id,
        promoCodeId,
      });
    } else if (abonnementId && abonnementPrice) {
      response = await createTicketAndOrder({
        userId, abonnementId, abonnementPrice, quantity,
        amount: paymentIntent.amount,
        paymentIntentId: paymentIntent.id,
        promoCodeId,
      });
    }
    if (!response?.success) throw new Error(`Unable to create order for ${paymentIntent.id}`);

    if (promoCodeId) {
      try {
        await updatePromoCodeUsage({ userRef, userDoc, promoCodeId });
      } catch (error) {
        console.error("Error updating promo code usage:", error);
      }
    }

    // Email failure must not change a paid and created order into an error.
    try {
      const userData = await getUserDocument(userId);
      if (response.data.tickets.length) {
        await generateAndSendTicketPDF(userData, response.data.tickets, response.data.order);
      } else if (response.data.abonnements?.length) {
        await generateAndSendTicketPDF(userData, [], response.data.order, response.data.abonnements);
      }
    } catch (error) {
      console.error("Order created but ticket email failed:", error);
    }

    return { state: "fulfilled", orderId: response.data.orderId };
  } catch (error) {
    const order = await findOrderByPaymentIntentId(paymentIntent.id);
    if (!order) {
      await lock.ref.delete().catch((lockError) => {
        console.error("Unable to release payment intent lock:", lockError);
      });
    }
    throw error;
  }
};
