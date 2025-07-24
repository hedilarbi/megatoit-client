import {
  createTicketAndOrder,
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

      const matchId = paymentIntent.metadata?.matchId;
      const ticketPrice = paymentIntent.metadata?.ticketPrice;
      const abonnementId = paymentIntent.metadata?.abonnementId;
      const abonnementPrice = paymentIntent.metadata?.abonnementPrice;
      let response = null;
      if (matchId && quantity && ticketPrice) {
        response = await createTicketAndOrder({
          userId,
          matchId,
          quantity,
          ticketPrice: parseFloat(ticketPrice),
          amount: paymentIntent.amount / 100, // Convert from cents to dollars
          paymentIntentId: paymentIntent.id,
        });
      }
      if (abonnementId && abonnementPrice) {
        response = await createTicketAndOrder({
          userId,
          abonnementId,

          abonnementPrice,
          amount: paymentIntent.amount / 100, // Convert from cents to dollars
          paymentIntentId: paymentIntent.id,
        });
      }

      if (response.success) {
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
