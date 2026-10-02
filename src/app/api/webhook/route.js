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
      // Le paiement est relu chez Stripe : un événement forgé avec un secret de webhook
      // volé ne suffit pas à faire émettre des billets.
      const paymentIntent = await stripe.paymentIntents.retrieve(event.data.object.id);
      // Un paiement créé hors du site (sans les métadonnées de /api/create-payment-intent)
      // ne correspond à aucune commande : on l'ignore au lieu de faire réessayer Stripe.
      if (!paymentIntent.metadata?.userId) {
        console.warn("PaymentIntent without site metadata ignored:", paymentIntent.id);
        return Response.json({ received: true, ignored: true });
      }
      const result = await fulfillSuccessfulPaymentIntent(paymentIntent, event.id);
      return Response.json({ received: true, ...result });
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    // Stripe retries webhook deliveries only for non-2xx responses.
    return Response.json({ error: "Webhook Error" }, { status: 500 });
  }
}
