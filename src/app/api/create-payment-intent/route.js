import { NextResponse } from "next/server";

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
      userName,
      email,
    } = await request.json();

    // Validate input
    if (!amount || !currency || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
        }
      );
    }
    const customer = await getOrCreateCustomer(email, userName, userId);

    let paymentIntent = null;
    if (matchId && quantity && ticketPrice) {
      paymentIntent = await stripe.paymentIntents.create({
        amount: amount, // Convert to cents
        currency: currency,
        customer: customer?.id,
        metadata: {
          userId: userId,
          quantity,
          matchId,
          ticketPrice,
        },
        receipt_email: email,
        automatic_payment_methods: {
          enabled: true,
        },
      });
    }
    if (abonnementId && abonnementPrice) {
      paymentIntent = await stripe.paymentIntents.create({
        amount: amount, // Convert to cents
        currency: currency,
        customer: customer?.id,
        metadata: {
          userId: userId,
          abonnementId,
          abonnementPrice,
        },
        automatic_payment_methods: {
          enabled: true,
        },
        receipt_email: email,
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
