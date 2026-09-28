import { NextResponse } from "next/server";
import crypto from "crypto";
import { calculateSubscriptionOrderPricing } from "@/services/subscriptionPricing.service";
import { findNextHomeMatch } from "@/services/ticket.service";
import {
  PricingError,
  calculateMatchOrderPricing,
  getValidPromoCode,
} from "@/services/orderPricing.service";

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});
async function getOrCreateCustomer(email, name, userId) {
  if (!email) return null;
  // Reuse if exists
  const existing = await stripe.customers.list({ email, limit: 1 });
  if (existing.data.length > 0) {
    // Optionally keep name up to date
    const cust = existing.data[0];
    if (name && cust.name !== name) {
      await stripe.customers.update(cust.id, { name });
    }
    return cust;
  }
  // Or create
  return await stripe.customers.create({
    email,
    name,
    metadata: userId ? { userId } : undefined,
  });
}

const sanitizeSessionPart = (value) =>
  String(value || "session")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 40) || "session";

const buildIntentIdempotencyKey = ({
  checkoutSessionId,
  userId,
  email,
  amount,
  currency,
  quantity,
  matchId,
  ticketPrice,
  abonnementPrice,
  abonnementId,
  codeId,
}) => {
  const hashInput = JSON.stringify({
    userId,
    email: email || null,
    amount,
    currency,
    quantity: quantity || null,
    matchId: matchId || null,
    ticketPrice: ticketPrice || null,
    abonnementPrice: abonnementPrice || null,
    abonnementId: abonnementId || null,
    codeId: codeId || null,
  });
  const hash = crypto.createHash("sha256").update(hashInput).digest("hex");
  const sessionPart = sanitizeSessionPart(
    checkoutSessionId || crypto.randomUUID()
  );
  return `checkout_${sessionPart}_${hash.slice(0, 24)}`;
};

// The checkout page and the server use the same formula, so the amounts should
// always be equal. 1 cent is still accepted (logged) so an unexpected rounding
// never blocks a real customer; anything more is refused and logged.
const isAmountAccepted = (expectedCents, receivedCents, details) => {
  const gap = Math.abs(expectedCents - receivedCents);
  if (gap === 0) return true;
  const log = { expectedCents, receivedCents, ...details };
  if (gap === 1) {
    console.warn("Payment amount 1 cent off (accepted):", log);
    return true;
  }
  console.error("Payment amount mismatch (refused):", log);
  return false;
};

export async function POST(request) {
  try {
    const {
      amount,
      currency,
      userId,
      quantity,
      matchId,
      ticketPrice,
      abonnementPrice,
      abonnementId,
      abonnementQuantity,
      userName,
      email,
      codeId,
      checkoutSessionId,
    } = await request.json();

    // Validate input
    const amountInCents = Number(amount);
    if (
      !Number.isInteger(amountInCents) ||
      amountInCents <= 0 ||
      !currency ||
      !userId
    ) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
        }
      );
    }

    const hasMatchPurchase = Boolean(matchId && quantity && ticketPrice);
    const parsedAbonnementQuantity = Number.parseInt(abonnementQuantity || quantity || "1", 10);
    const hasAbonnementPurchase = Boolean(
      abonnementId &&
        abonnementPrice &&
        Number.isInteger(parsedAbonnementQuantity) &&
        parsedAbonnementQuantity >= 1 &&
        parsedAbonnementQuantity <= 100
    );
    if (hasMatchPurchase === hasAbonnementPurchase) {
      return new Response(
        JSON.stringify({
          error:
            "Invalid purchase payload: expected either match purchase or abonnement purchase",
        }),
        { status: 400 }
      );
    }

    // The promo code and the price are checked here: the browser only displays
    // them, so a request sent by hand must not get a cheaper order.
    let promo = null;
    if (codeId) {
      try {
        promo = await getValidPromoCode(codeId, userId);
      } catch (err) {
        return new Response(
          JSON.stringify({ error: err instanceof PricingError ? err.message : "Code promo invalide" }),
          { status: 400 }
        );
      }
    }

    // "freeTicket" promo codes only apply to match tickets: they add one free
    // ticket for the next home match per purchased ticket.
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

    // SERVER-SIDE MATCH TICKET PRICE VERIFICATION (Anti-Fraud)
    let verifiedTicketPrice = ticketPrice;
    let verifiedQuantity = quantity;
    if (hasMatchPurchase) {
      try {
        const pricing = await calculateMatchOrderPricing({ matchId, quantity, promo });
        verifiedTicketPrice = pricing.unitPrice;
        verifiedQuantity = pricing.quantity;
        if (!isAmountAccepted(pricing.amountInCents, amountInCents, { userId, matchId, quantity, codeId })) {
          return new Response(JSON.stringify({ error: "Invalid payment amount" }), {
            status: 400,
          });
        }
      } catch (err) {
        console.error("Error verifying match ticket price server-side:", err);
        return new Response(
          JSON.stringify({ error: err instanceof PricingError ? err.message : "Unable to verify ticket price" }),
          { status: 400 }
        );
      }
    }

    // SERVER-SIDE SUBSCRIPTION PRICE VERIFICATION (Anti-Fraud)
    let verifiedAbonnementPrice = abonnementPrice;
    if (hasAbonnementPurchase) {
      try {
        const pricing = await calculateSubscriptionOrderPricing({
          abonnementId,
          quantity: parsedAbonnementQuantity,
          promo,
        });
        verifiedAbonnementPrice = pricing.unitPrice;
        if (!isAmountAccepted(pricing.amountInCents, amountInCents, { userId, abonnementId, quantity: parsedAbonnementQuantity, codeId })) {
          return new Response(JSON.stringify({ error: "Invalid payment amount" }), {
            status: 400,
          });
        }
      } catch (err) {
        console.error("Error verifying abonnement price server-side:", err);
        return new Response(JSON.stringify({ error: "Unable to verify subscription price" }), {
          status: 400,
        });
      }
    }

    const customer = await getOrCreateCustomer(email, userName, userId);
    const idempotencyKey = buildIntentIdempotencyKey({
      checkoutSessionId,
      userId,
      email,
      amount: amountInCents,
      currency,
      matchId,
      ticketPrice: verifiedTicketPrice,
      abonnementPrice: verifiedAbonnementPrice,
      abonnementId,
      quantity: hasAbonnementPurchase ? parsedAbonnementQuantity : verifiedQuantity,
      codeId,
    });

    let paymentIntent = null;
    if (hasMatchPurchase) {
      const metadata = {
        userId: String(userId),
        quantity: String(verifiedQuantity),
        matchId: String(matchId),
        ticketPrice: String(verifiedTicketPrice),
      };
      if (codeId) metadata.codeId = String(codeId);
      if (freeMatchId) metadata.freeMatchId = String(freeMatchId);
      if (checkoutSessionId) {
        metadata.checkoutSessionId = String(checkoutSessionId);
      }

      paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: currency,
        customer: customer?.id,
        metadata,
        receipt_email: email,
        automatic_payment_methods: {
          enabled: true,
        },
      }, {
        idempotencyKey,
      });
    }
    if (hasAbonnementPurchase) {
      const metadata = {
        userId: String(userId),
        abonnementId: String(abonnementId),
        abonnementPrice: String(verifiedAbonnementPrice),
        quantity: String(parsedAbonnementQuantity),
      };
      if (codeId) metadata.codeId = String(codeId);
      if (checkoutSessionId) {
        metadata.checkoutSessionId = String(checkoutSessionId);
      }

      paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: currency,
        customer: customer?.id,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
        receipt_email: email,
      }, {
        idempotencyKey,
      });
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
