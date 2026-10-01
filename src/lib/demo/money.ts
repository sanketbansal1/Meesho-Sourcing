import type { Pricing, RouteQuote } from "./types";

export const DEMO_TAX_RATE = 0.05;

/** Format integer paise as ₹ with Indian grouping. */
export function rupees(paise: number, opts: { decimals?: boolean } = {}): string {
  const value = paise / 100;
  const str = value.toLocaleString("en-IN", {
    minimumFractionDigits: opts.decimals ? 2 : 0,
    maximumFractionDigits: opts.decimals ? 2 : 0,
  });
  return `₹${str}`;
}

/** Per-unit price, shown with up to 2 decimals only when needed. */
export function perUnit(paise: number, unit: string): string {
  return `${rupees(paise, { decimals: paise % 100 !== 0 })}/${unit}`;
}

export function roundPaise(n: number): number {
  return Math.round(n);
}

/**
 * Derive a full delivered price from a quote. Returns null when the quantity
 * falls outside the quantity range the quote was given for — the prototype then
 * asks for a fresh quote instead of inventing a price.
 */
export function priceQuote(quote: RouteQuote, qty: number): Pricing | null {
  if (!Number.isFinite(qty) || qty <= 0) return null;
  if (qty < quote.minQty || qty > quote.maxQty) return null;
  const materialPaise = roundPaise(quote.unitPricePaise * qty);
  const deliveryPaise = quote.deliveryPaise;
  const preTax = materialPaise + deliveryPaise;
  const taxPaise = roundPaise(preTax * DEMO_TAX_RATE);
  return {
    qty,
    unitPricePaise: quote.unitPricePaise,
    materialPaise,
    deliveryPaise,
    taxPaise,
    totalPaise: preTax + taxPaise,
  };
}

export function preTaxTotal(p: Pricing): number {
  return p.materialPaise + p.deliveryPaise;
}

export function savingsVsLocal(p: Pricing, localUnitPaise: number): { amount: number; pct: number } {
  const local = localUnitPaise * p.qty; // local quote has no delivery charge
  const amount = local - preTaxTotal(p);
  return { amount, pct: local > 0 ? (amount / local) * 100 : 0 };
}
