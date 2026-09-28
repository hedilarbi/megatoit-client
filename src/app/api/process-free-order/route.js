import admin from "@/lib/firebaseAdmin";
import {
  createTicketAndOrder,
  findNextHomeMatch,
  getUserDocument,
} from "@/services/ticket.service";
import { generateAndSendTicketPDF } from "@/utils/generateAndSendTicketPDF";
import { calculateSubscriptionOrderPricing } from "@/services/subscriptionPricing.service";
import {
  PricingError,
  calculateMatchOrderPricing,
  getValidPromoCode,
} from "@/services/orderPricing.service";

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
      promoCodeId,
      abonnementId,
      abonnementQuantity,
    } = body;

    // Ensure the token UID matches the requested userId
    if (decodedToken.uid !== userId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    // Exactly one purchase type. Prices sent by the browser are ignored: the
    // order is priced on the server and must really come to $0.
    const hasMatchPurchase = Boolean(matchId && quantity);
    const hasAbonnementPurchase = Boolean(abonnementId);
    if (hasMatchPurchase === hasAbonnementPurchase) {
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

    // 1. Validate everything before writing anything
    let promo = null;
    if (promoCodeId) {
      try {
        promo = await getValidPromoCode(promoCodeId, userId);
      } catch (err) {
        return new Response(
          JSON.stringify({ error: err instanceof PricingError ? err.message : "Code promo invalide" }),
          { status: 400 }
        );
      }
    }

    let freeMatchId = null;
    if (promo?.type === "freeTicket") {
      if (!hasMatchPurchase) {
        return new Response(
          JSON.stringify({ error: "Ce code promo est valide uniquement pour des billets de match" }),
          { status: 400 }
        );
      }
      if (promo.matchId && promo.matchId !== matchId) {
        return new Response(
          JSON.stringify({ error: "Ce code promo n'est pas applicable à ce match" }),
          { status: 400 }
        );
      }
      const nextHomeMatch = await findNextHomeMatch(matchId);
      if (!nextHomeMatch) {
        return new Response(
          JSON.stringify({ error: "Aucun match à domicile à venir pour ce code promo" }),
          { status: 400 }
        );
      }
      freeMatchId = nextHomeMatch.id;
    }

    let pricing;
    try {
      pricing = hasMatchPurchase
        ? await calculateMatchOrderPricing({ matchId, quantity, promo })
        : await calculateSubscriptionOrderPricing({
            abonnementId,
            quantity: abonnementQuantity || "1",
            promo,
          });
    } catch (err) {
      console.error("Error verifying price in process-free-order:", err);
      return new Response(
        JSON.stringify({ error: err instanceof PricingError ? err.message : "Unable to verify price" }),
        { status: 400 }
      );
    }
    if (pricing.amountInCents !== 0) {
      return new Response(JSON.stringify({ error: "Invalid free order amount" }), {
        status: 400,
      });
    }

    // 2. Count the promo code use, then create the order
    if (promo) {
      const usedPromoCodes = userDoc.data().usedPromoCodes || [];
      const existingPromoIndex = usedPromoCodes.findIndex(
        (item) => item.promoCode === promo.id
      );

      if (existingPromoIndex !== -1) {
        usedPromoCodes[existingPromoIndex].numberOfUses += 1;
      } else {
        usedPromoCodes.push({
          promoCode: promo.id,
          numberOfUses: 1,
        });
      }

      await userRef.update({ usedPromoCodes });
      await admin
        .firestore()
        .collection("promoCodes")
        .doc(promo.id)
        .update({
          used: admin.firestore.FieldValue.increment(1),
        });
    }

    let response = null;
    if (hasMatchPurchase) {
      response = await createTicketAndOrder({
        userId,
        matchId,
        quantity: pricing.quantity,
        ticketPrice: pricing.unitPrice,
        amount: 0,
        paymentIntentId: null,
        promoCodeId: promo?.id || null,
        freeMatchId,
      });
    } else {
      response = await createTicketAndOrder({
        userId,
        abonnementId,
        paymentIntentId: null,
        abonnementPrice: pricing.unitPrice,
        quantity: pricing.quantity,
        amount: 0,
        promoCodeId: promo?.id || null,
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
        [...response.data.tickets, ...response.data.freeTickets],
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
