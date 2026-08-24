import admin from "@/lib/firebaseAdmin";
import {
  createTicketAndOrder,
  getUserDocument,
} from "@/services/ticket.service";
import { generateAndSendTicketPDF } from "@/utils/generateAndSendTicketPDF";
import { calculateSubscriptionOrderPricing } from "@/services/subscriptionPricing.service";

export const runtime = "nodejs";
export const config = {
  api: { bodyParser: false },
  background: { maxDuration: 300 }, // keep it alive for up to 5 minutes
};

export async function POST(request) {
  try {
    // SECURITY FIX #4: verify Firebase ID token so only the authenticated user
    // can place an order under their own userId. Previously any userId was accepted.
    const authHeader = request.headers.get("authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!idToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 });
    }

    const body = await request.json();
    const {
      userId,
      matchId,
      quantity,
      ticketPrice,
      promoCodeId,
      abonnementId,
      abonnementPrice,
      abonnementQuantity,
      amount,
    } = body;

    // Ensure the token UID matches the requested userId
    if (decodedToken.uid !== userId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    // BUG FIX #2: validate that at least one valid purchase type is present
    // to avoid a TypeError crash when response stays null
    const hasMatchPurchase = Boolean(matchId && quantity && ticketPrice);
    const parsedAbonnementQuantity = Number.parseInt(abonnementQuantity || "1", 10);
    const hasAbonnementPurchase = Boolean(
      abonnementId &&
        abonnementPrice &&
        Number.isInteger(parsedAbonnementQuantity) &&
        parsedAbonnementQuantity >= 1 &&
        parsedAbonnementQuantity <= 100
    );
    if (!hasMatchPurchase && !hasAbonnementPurchase) {
      return new Response(
        JSON.stringify({ error: "Invalid purchase payload: matchId or abonnementId required" }),
        { status: 400 }
      );
    }

    const userRef = admin.firestore().collection("users").doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      console.error("User not found:", userId);
      return new Response("User not found", { status: 404 });
    }
    if (promoCodeId) {
      const promoCodeRef = admin
        .firestore()
        .collection("promoCodes")
        .doc(promoCodeId);
      const promoCodeDoc = await promoCodeRef.get();
      if (promoCodeId && !promoCodeDoc.exists) {
        console.error("Promo code not found:", promoCodeId);
        return new Response("Promo code not found", { status: 404 });
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

      await userRef.update({ usedPromoCodes });
      await promoCodeRef.update({
        used: admin.firestore.FieldValue.increment(1),
      });
    }

    let response = null;
    if (hasMatchPurchase) {
      response = await createTicketAndOrder({
        userId,
        matchId,
        quantity,
        ticketPrice: parseFloat(ticketPrice),
        amount, // Convert from cents to dollars
        paymentIntentId: null,
        promoCodeId,
      });
    }
    if (hasAbonnementPurchase) {
      let verifiedPrice = abonnementPrice;
      try {
        const pricing = await calculateSubscriptionOrderPricing({
          abonnementId,
          quantity: parsedAbonnementQuantity,
          promoCodeId,
        });
        verifiedPrice = pricing.unitPrice;
        if (pricing.total !== 0 || Number(amount) !== 0) {
          return new Response(JSON.stringify({ error: "Invalid free order amount" }), {
            status: 400,
          });
        }
      } catch (e) {
        console.error("Error verifying abonnement price in process-free-order:", e);
        return new Response(JSON.stringify({ error: "Unable to verify subscription price" }), {
          status: 400,
        });
      }

      response = await createTicketAndOrder({
        userId,
        abonnementId,
        paymentIntentId: null,
        abonnementPrice: verifiedPrice,
        quantity: parsedAbonnementQuantity,
        amount,

        promoCodeId,
      });
    }

    // BUG FIX #2: guard against null response (should not happen after validation above)
    if (!response || !response.success) {
      return new Response(
        JSON.stringify({ error: "Failed to process order" }),
        { status: 500 }
      );
    }

    const userData = await getUserDocument(userId);
    if (response.data.tickets.length) {
      await generateAndSendTicketPDF(
        userData,
        response.data.tickets,
        response.data.order
      );
    }
    if (response.data.abonnements?.length) {
      await generateAndSendTicketPDF(
        userData,
        [],
        response.data.order,
        response.data.abonnements
      );
    }

    return new Response(JSON.stringify({ data: response.data.orderId }), {
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "Webhook Error" }), {
      status: 400,
    });
  }
}
