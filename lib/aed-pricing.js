export const AED_PRICE_STEP_TOMAN = 50000;

/**
 * Converts an AED base price and a validated AED-to-toman rate into a sale price.
 * The input rate must already be in toman, not rial.
 */
export function calculateAedSalePrice(basePriceAed, aedToTomanRate) {
  const base = Number(basePriceAed);
  const rate = Number(aedToTomanRate);

  if (!Number.isFinite(base) || base <= 0) {
    throw new Error("قیمت پایه درهم باید عددی مثبت و معتبر باشد.");
  }
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error("نرخ درهم به تومان باید عددی مثبت و معتبر باشد.");
  }

  const rawToman = base * rate;
  if (!Number.isFinite(rawToman) || rawToman <= 0) {
    throw new Error("قیمت محاسبه‌شده معتبر نیست.");
  }

  const salePriceToman = Math.ceil(rawToman / AED_PRICE_STEP_TOMAN) * AED_PRICE_STEP_TOMAN;
  return {
    basePriceAed: base,
    aedToTomanRate: rate,
    rawPriceToman: Math.ceil(rawToman),
    salePriceToman,
    roundingStepToman: AED_PRICE_STEP_TOMAN,
  };
}

/** TGJU rates displayed in rial must be converted to toman before calculation. */
export function rialToToman(rial) {
  const value = Number(rial);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("نرخ ریالی نامعتبر است.");
  }
  return value / 10;
}
