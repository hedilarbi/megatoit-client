import { fulfillSuccessfulPaymentIntent } from "@/services/paymentFulfillment.service";
import { findOrderByPaymentIntentId } from "@/services/ticket.service";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const paymentIntentId = searchParams.get("payment_intent");
  if (!paymentIntentId) {
    return NextResponse.json(
      { success: false, status: "invalid", error: "Missing payment_intent" },
      { status: 400 }
    );
  }

  try {
    const existingOrder = await findOrderByPaymentIntentId(paymentIntentId);
    if (existingOrder) {
      return NextResponse.json({
        success: true,
        status: "fulfilled",
        orderId: existingOrder.id,
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status === "succeeded") {
      const result = await fulfillSuccessfulPaymentIntent(
        paymentIntent,
        `status_recovery_${paymentIntent.id}`
      );
      return NextResponse.json({
        success: result.state === "fulfilled",
        status: result.state,
        orderId: result.orderId,
      });
    }

    const failedStatuses = new Set([
      "canceled",
      "requires_payment_method",
      "requires_action",
    ]);
    return NextResponse.json({
      success: false,
      status: failedStatuses.has(paymentIntent.status)
        ? "payment_failed"
        : "processing",
      paymentStatus: paymentIntent.status,
    });
  } catch (error) {
    console.error("Error checking or fulfilling payment:", error);
    return NextResponse.json(
      { success: false, status: "processing", error: "Status unavailable" },
      { status: 503 }
    );
  }
}
