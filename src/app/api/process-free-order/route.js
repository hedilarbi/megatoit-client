import admin from "@/lib/firebaseAdmin";
import {
  createTicketAndOrder,
  getUserDocument,
} from "@/services/ticket.service";
import { generateAndSendTicketPDF } from "@/utils/generateAndSendTicketPDF";

export const runtime = "nodejs";
export const config = {
  api: { bodyParser: false },
  background: { maxDuration: 300 }, // keep it alive for up to 5 minutes
};

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      matchId,
      quantity,
      ticketPrice,
      promoCodeId,
      abonnementId,
      abonnementPrice,
      amount,
    } = body;

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
    }

    let response = null;
    if (matchId && quantity && ticketPrice) {
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
    if (abonnementId && abonnementPrice) {
      response = await createTicketAndOrder({
        userId,
        abonnementId,
        paymentIntentId: null,
        abonnementPrice,
        amount, // Convert from cents to dollars

        promoCodeId,
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
