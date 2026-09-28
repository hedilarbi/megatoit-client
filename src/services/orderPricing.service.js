import admin from "@/lib/firebaseAdmin";
import { isActiveInQuebec_DateOnly_0000_to_2359 } from "@/utils/promoDateUtils";

const MAX_TICKETS_PER_ORDER = 100;

export class PricingError extends Error {}

// Server-side copy of verifyPromoCode (checkout page): the browser checks are
// only for display, the API must not trust a promo code it did not check.
export const getValidPromoCode = async (promoCodeId, userId) => {
  const db = admin.firestore();
  const promoDoc = await db.collection("promoCodes").doc(String(promoCodeId)).get();
  if (!promoDoc.exists) throw new PricingError("Code promo non trouvé");

  const promo = { id: promoDoc.id, ...promoDoc.data() };
  if (!isActiveInQuebec_DateOnly_0000_to_2359(promo.startDate, promo.endDate)) {
    throw new PricingError("Code promo expiré");
  }
  if (typeof promo.totalUsage === "number" && (promo.used || 0) >= promo.totalUsage) {
    throw new PricingError("Code promo épuisé");
  }

  const userDoc = await db.collection("users").doc(String(userId)).get();
  if (!userDoc.exists) throw new PricingError("Utilisateur non trouvé");
  const used = userDoc.data()?.usedPromoCodes?.find((u) => u.promoCode === promo.id);
  if (
    used &&
    typeof promo.usagePerUser === "number" &&
    (used.numberOfUses || 0) >= promo.usagePerUser
  ) {
    throw new PricingError("Code promo déjà utilisé");
  }

  return promo;
};

// Same formula and same operation order as the checkout page (CheckoutContent):
// with floats, (x * v) / 100 and x * (v / 100) can round to different cents.
// Keep both sides identical so the amounts always match exactly.
export const applyPromoAndTaxes = async (subtotal, promo) => {
  let discounted = subtotal;
  if (promo?.type === "percent") {
    discounted *= 1 - Number(promo.percent || 0) / 100;
  } else if (promo?.type === "amount") {
    discounted = Math.max(0, discounted - Number(promo.amount || 0));
  }

  const taxesSnapshot = await admin.firestore().collection("taxes").get();
  const taxTotal = taxesSnapshot.docs.reduce(
    (sum, taxDoc) => sum + (discounted * Number(taxDoc.data().valeur || 0)) / 100,
    0
  );
  const total = Number((discounted + taxTotal).toFixed(2));
  return { total, amountInCents: Math.round(total * 100) };
};

// Match tickets are priced from the match document, never from the request.
export const calculateMatchOrderPricing = async ({ matchId, quantity, promo }) => {
  const parsedQuantity = Number.parseInt(quantity, 10);
  if (
    !Number.isInteger(parsedQuantity) ||
    parsedQuantity < 1 ||
    parsedQuantity > MAX_TICKETS_PER_ORDER
  ) {
    throw new PricingError("Quantité de billets invalide");
  }

  const matchDoc = await admin.firestore().collection("matchs").doc(String(matchId)).get();
  if (!matchDoc.exists) throw new PricingError("Match introuvable");

  const match = matchDoc.data();
  const unitPrice = Number(match.price);
  if (!Number.isFinite(unitPrice) || unitPrice < 0) {
    throw new PricingError("Prix du match invalide");
  }
  if (Number(match.availableSeats) < parsedQuantity) {
    throw new PricingError("Nombre de billets séléctionné est indisponible");
  }

  const { total, amountInCents } = await applyPromoAndTaxes(
    unitPrice * parsedQuantity,
    promo
  );
  return { quantity: parsedQuantity, unitPrice, total, amountInCents };
};
