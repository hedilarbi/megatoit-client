import { NextResponse } from "next/server";

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});
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

    let paymentIntent = null;
    if (matchId && quantity && ticketPrice) {
      paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency: currency,
        metadata: {
          userId: userId,
          quantity,
          matchId,
          ticketPrice,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });
    }
    if (abonnementId && abonnementPrice) {
      paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency: currency,
        metadata: {
          userId: userId,
          abonnementId,
          abonnementPrice,
        },
        automatic_payment_methods: {
          enabled: true,
        },
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
