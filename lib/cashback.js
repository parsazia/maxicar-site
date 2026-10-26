/**
 * محاسبه‌گر مستقل بازگشت وجه ماکسیکار.
 * ورودی باید مجموع خرید واجد شرایط ماهانه، به تومان و از منبع معتبر سمت سرور باشد.
 * این ماژول به‌تنهایی درخواست پرداخت یا احراز هویت انجام نمی‌دهد.
 */
export const CASHBACK_TIERS = [
  { threshold: 1_000_000_000, rate: 0.15, label: "سطح سوم" },
  { threshold: 500_000_000, rate: 0.10, label: "سطح دوم" },
  { threshold: 100_000_000, rate: 0.05, label: "سطح اول" },
];

export function calculateCashback(monthlyEligiblePurchase) {
  if (
    typeof monthlyEligiblePurchase !== "number" ||
    !Number.isSafeInteger(monthlyEligiblePurchase) ||
    monthlyEligiblePurchase < 0
  ) {
    throw new TypeError("مجموع خرید ماهانه باید عدد صحیح نامنفی به تومان باشد.");
  }

  // سیاست فعلی: «بیش از» هر سقف، نه «برابر یا بیشتر».
  const tier = CASHBACK_TIERS.find(
    (candidate) => monthlyEligiblePurchase > candidate.threshold
  );

  const nextThreshold =
    [...CASHBACK_TIERS]
      .reverse()
      .find((candidate) => monthlyEligiblePurchase <= candidate.threshold)
      ?.threshold ?? null;

  return {
    monthlyEligiblePurchase,
    tierLabel: tier?.label ?? "بدون سطح فعال",
    rate: tier?.rate ?? 0,
    ratePercent: tier ? tier.rate * 100 : 0,
    cashbackAmount: tier
      ? Math.floor((monthlyEligiblePurchase * tier.rate) / 1)
      : 0,
    nextThreshold,
    amountToNextThreshold:
      nextThreshold === null
        ? 0
        : Math.max(0, nextThreshold + 1 - monthlyEligiblePurchase),
    calculationBasis: "entire_eligible_monthly_purchase",
    currency: "IRR_TOMAN",
  };
}
