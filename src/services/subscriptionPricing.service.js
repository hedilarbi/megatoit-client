import admin from "@/lib/firebaseAdmin";
import { applyPromoAndTaxes } from "@/services/orderPricing.service";

const PRE_SALE_CUTOFF = new Date("2026-09-14T03:59:59.999Z");

// `promo` must come from getValidPromoCode (already checked for this user)
export const calculateSubscriptionOrderPricing = async ({
  abonnementId,
  quantity,
  promo,
}) => {
  const parsedQuantity = Number.parseInt(quantity, 10);
  if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > 100) {
    throw new Error("Invalid subscription quantity");
  }

  const db = admin.firestore();
  const abonnementDoc = await db.collection("abonements").doc(String(abonnementId)).get();
  if (!abonnementDoc.exists) throw new Error("Subscription product not found");

  const abonnement = abonnementDoc.data();
  let unitPrice = Number(abonnement.price || 0);
  if (
    new Date() <= PRE_SALE_CUTOFF &&
    abonnement.reducedPrice !== undefined &&
    abonnement.reducedPrice !== null &&
    Number(abonnement.reducedPrice) > 0
  ) {
    unitPrice = Number(abonnement.reducedPrice);
  }
  if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
    throw new Error("Invalid subscription price");
  }

  const { total, amountInCents } = await applyPromoAndTaxes(
    unitPrice * parsedQuantity,
    promo
  );

  return {
    quantity: parsedQuantity,
    unitPrice,
    total,
    amountInCents,
  };
};
