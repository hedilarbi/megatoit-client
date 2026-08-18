/**
 * Utility functions for Subscription (Abonnement) Pricing
 * Presale / Reduced price is valid up to September 6, 2026 (inclusive).
 * After September 6, 2026 (starting Sept 7, 2026), standard price applies.
 */

// September 6, 2026 23:59:59 EDT (Québec time, UTC-4) = 2026-09-07T03:59:59.999Z
export const SUBSCRIPTION_PRE_SALE_CUTOFF_UTC = new Date("2026-09-07T03:59:59.999Z");

/**
 * Checks if the subscription presale (reduced price) is active based on the given date (default: now).
 * @param {Date|string|number} [date=new Date()]
 * @returns {boolean}
 */
export function isSubscriptionPreSaleActive(date = new Date()) {
  const now = date instanceof Date ? date : new Date(date);
  return now.getTime() <= SUBSCRIPTION_PRE_SALE_CUTOFF_UTC.getTime();
}

/**
 * Calculates the effective price of a subscription.
 * Uses `reducedPrice` on or before September 6, 2026, and `price` after September 6, 2026.
 * @param {Object} abonnement - Subscription object containing price and reducedPrice
 * @param {Date|string|number} [date=new Date()] - Date to check against cutoff
 * @returns {number} Effective price
 */
export function getEffectiveSubscriptionPrice(abonnement, date = new Date()) {
  if (!abonnement) return 0;

  const now = date instanceof Date ? date : new Date(date);
  const isPreSale = isSubscriptionPreSaleActive(now);

  const reducedPriceNum = Number(abonnement.reducedPrice);
  if (isPreSale && !isNaN(reducedPriceNum) && reducedPriceNum > 0) {
    return reducedPriceNum;
  }

  return Number(abonnement.price || 0);
}
