import admin from "@/lib/firebaseAdmin";
import {
  createTicketAndOrder,
  findOrderByPaymentIntentId,
  getUserDocument,
} from "@/services/ticket.service";
import { generateAndSendTicketPDF } from "@/utils/generateAndSendTicketPDF";
import Stripe from "stripe";

export const runtime = "nodejs";
export const config = {
  api: { bodyParser: false },
  background: { maxDuration: 300 }, // keep it alive for up to 5 minutes
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const updatePromoCodeUsage = async ({ userRef, userDoc, promoCodeId }) => {
  if (!promoCodeId) {
    return;
  }

  const promoCodeRef = admin
    .firestore()
    .collection("promoCodes")
    .doc(promoCodeId);
  const promoCodeDoc = await promoCodeRef.get();

  if (!promoCodeDoc.exists) {
    throw new Error(`Promo code not found: ${promoCodeId}`);
  }

  const usedPromoCodes = userDoc.data().usedPromoCodes || [];
  const existingPromoIndex = usedPromoCodes.findIndex(
    (item) => item.promoCode === promoCodeId
  );

  if (existingPromoIndex !== -1) {
    usedPromoCodes[existingPromoIndex].numberOfUses += 1;
  } else {
    usedPromoCodes.push({
      promoCode: promoCodeId,
      numberOfUses: 1,
    });
  }

  await promoCodeRef.update({
    used: admin.firestore.FieldValue.increment(1),
  });
  await userRef.update({ usedPromoCodes });
};

const isAlreadyExistsError = (error) => {
  if (!error) return false;
  return (
    error.code === 6 ||
    error.code === "already-exists" ||
    /already exists/i.test(error.message || "")
  );
};

const acquirePaymentIntentLock = async (paymentIntentId, eventId) => {
  const lockRef = admin
    .firestore()
    .collection("payment_intent_locks")
    .doc(paymentIntentId);

  try {
    await lockRef.create({
      paymentIntentId,
      eventId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { acquired: true, ref: lockRef };
  } catch (error) {
    if (isAlreadyExistsError(error)) {
      return { acquired: false, ref: lockRef };
    }
    throw error;
  }
};

export async function POST(request) {
  try {
    const signature = request.headers.get("stripe-signature");
    // Grab the raw bytes exactly as Stripe sent them
    const rawBody = Buffer.from(await request.arrayBuffer());

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("⚠️  Webhook signature verification failed.", err);
      return new Response("Invalid signature", { status: 400 });
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const userId = paymentIntent.metadata?.userId;
      const quantity = parseInt(paymentIntent.metadata?.quantity || "1");
      const promoCodeId = paymentIntent.metadata?.codeId || null;
      const matchId = paymentIntent.metadata?.matchId;
      const ticketPrice = paymentIntent.metadata?.ticketPrice;
      const abonnementId = paymentIntent.metadata?.abonnementId;
      const abonnementPrice = paymentIntent.metadata?.abonnementPrice;

      const lock = await acquirePaymentIntentLock(paymentIntent.id, event.id);
      if (!lock.acquired) {
        const existingOrder = await findOrderByPaymentIntentId(paymentIntent.id);
        return new Response(
          JSON.stringify({
            received: true,
            duplicate: true,
            orderId: existingOrder?.id || null,
          }),
          { status: 200 }
        );
      }

      try {
        const existingOrder = await findOrderByPaymentIntentId(paymentIntent.id);
        if (existingOrder) {
          return new Response(
            JSON.stringify({
              received: true,
              duplicate: true,
              orderId: existingOrder.id,
            }),
            { status: 200 }
          );
        }

        const userRef = admin.firestore().collection("users").doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
          console.error("User not found:", userId);
          return new Response("User not found", { status: 404 });
        }

        let response = null;
        if (matchId && quantity && ticketPrice) {
          response = await createTicketAndOrder({
            userId,
            matchId,
            quantity,
            ticketPrice: parseFloat(ticketPrice),
            amount: paymentIntent.amount, // Convert from cents to dollars
            paymentIntentId: paymentIntent.id,
            promoCodeId,
          });
        }
        if (abonnementId && abonnementPrice) {
          response = await createTicketAndOrder({
            userId,
            abonnementId,

            abonnementPrice,
            amount: paymentIntent.amount, // Convert from cents to dollars
            paymentIntentId: paymentIntent.id,
            promoCodeId,
          });
        }

        if (response?.success) {
          if (promoCodeId) {
            try {
              await updatePromoCodeUsage({ userRef, userDoc, promoCodeId });
            } catch (promoError) {
              console.error("Error updating promo code usage:", promoError);
            }
          }

          const userData = await getUserDocument(userId);
          if (response.data.tickets.length) {
            await generateAndSendTicketPDF(
              userData,
              response.data.tickets,
              response.data.order
            );
          }
          if (response.data.abonnement) {
            await generateAndSendTicketPDF(
              userData,
              [],
              response.data.order,
              response.data.abonnement
            );
          }
        } else {
          throw new Error(
            `Unable to create order for payment intent ${paymentIntent.id}`
          );
        }
      } catch (processingError) {
        const existingOrder = await findOrderByPaymentIntentId(paymentIntent.id);
        if (!existingOrder) {
          await lock.ref.delete().catch((lockError) => {
            console.error("Unable to release payment intent lock:", lockError);
          });
        }
        throw processingError;
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "Webhook Error" }), {
      status: 400,
    });
  }
}
