import { NextResponse } from "next/server";
import crypto from "crypto";
import { calculateSubscriptionOrderPricing } from "@/services/subscriptionPricing.service";

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

    // SERVER-SIDE SUBSCRIPTION PRICE VERIFICATION (Anti-Fraud)
    let verifiedAbonnementPrice = abonnementPrice;
    if (hasAbonnementPurchase) {
      try {
        const pricing = await calculateSubscriptionOrderPricing({
          abonnementId,
          quantity: parsedAbonnementQuantity,
          promoCodeId: codeId,
        });
        verifiedAbonnementPrice = pricing.unitPrice;
        if (pricing.amountInCents !== amountInCents) {
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
      ticketPrice,
      abonnementPrice: verifiedAbonnementPrice,
      abonnementId,
      quantity: hasAbonnementPurchase ? parsedAbonnementQuantity : quantity,
      codeId,
    });

    let paymentIntent = null;
    if (hasMatchPurchase) {
      const metadata = {
        userId: String(userId),
        quantity: String(quantity),
        matchId: String(matchId),
        ticketPrice: String(ticketPrice),
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
