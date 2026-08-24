import admin from "@/lib/firebaseAdmin";

const PRE_SALE_CUTOFF = new Date("2026-09-07T03:59:59.999Z");

export const calculateSubscriptionOrderPricing = async ({
  abonnementId,
  quantity,
  promoCodeId,
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

  let subtotal = unitPrice * parsedQuantity;
  if (promoCodeId) {
    const promoDoc = await db.collection("promoCodes").doc(String(promoCodeId)).get();
    if (!promoDoc.exists) throw new Error("Promo code not found");
    const promo = promoDoc.data();
    if (promo.type === "percent") {
      subtotal *= 1 - Number(promo.percent || 0) / 100;
    } else if (promo.type === "amount") {
      subtotal = Math.max(0, subtotal - Number(promo.amount || 0));
    }
  }

  const taxesSnapshot = await db.collection("taxes").get();
  const taxTotal = taxesSnapshot.docs.reduce(
    (sum, taxDoc) => sum + subtotal * (Number(taxDoc.data().valeur || 0) / 100),
    0
  );
  const total = Number((subtotal + taxTotal).toFixed(2));

  return {
    quantity: parsedQuantity,
    unitPrice,
    total,
    amountInCents: Math.round(total * 100),
  };
};
