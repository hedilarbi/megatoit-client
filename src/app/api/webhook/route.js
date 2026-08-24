import { fulfillSuccessfulPaymentIntent } from "@/services/paymentFulfillment.service";
import Stripe from "stripe";

export const runtime = "nodejs";
export const config = {
  api: { bodyParser: false },
  background: { maxDuration: 300 },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function POST(request) {
  try {
    const signature = request.headers.get("stripe-signature");
    const rawBody = Buffer.from(await request.arrayBuffer());

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      return new Response("Invalid signature", { status: 400 });
    }

    if (event.type === "payment_intent.succeeded") {
      const result = await fulfillSuccessfulPaymentIntent(event.data.object, event.id);
      return Response.json({ received: true, ...result });
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    // Stripe retries webhook deliveries only for non-2xx responses.
    return Response.json({ error: "Webhook Error" }, { status: 500 });
  }
}
