import { PRODUCTS } from "./catalog";
import type { CategoryId, Product } from "./types";

export interface ParsedRequirement {
  understood: boolean;
  qty?: number;
  unit?: string;
  material?: string;
  categoryId?: CategoryId;
  colour?: string;
  gsm?: number;
  widthIn?: number;
  destination?: string;
  withinDays?: number;
  composition?: string;
  finish?: string;
  questions: string[];
  matchedProductId?: string;
}

const MATERIALS: {
  keys: string[];
  label: string;
  categoryId: CategoryId;
  productId?: string;
  composition?: string;
}[] = [
  {
    keys: ["cotton jersey", "single jersey", "jersey", "कॉटन जर्सी", "जर्सी"],
    label: "Cotton single jersey",
    categoryId: "fabrics",
    productId: "fab-jersey-black",
    composition: "100% cotton",
  },
  {
    keys: ["poplin", "woven cotton", "cotton fabric", "पॉपलिन"],
    label: "Woven cotton poplin",
    categoryId: "fabrics",
    productId: "fab-woven-cotton",
    composition: "100% cotton",
  },
  {
    keys: ["lining", "polyester lining", "लाइनिंग"],
    label: "Polyester lining",
    categoryId: "fabrics",
    productId: "fab-poly-lining",
    composition: "100% polyester",
  },
  { keys: ["zipper", "zip", "ज़िप", "जिप"], label: "Zipper", categoryId: "trims", productId: "trim-zipper-8" },
  { keys: ["elastic", "इलास्टिक"], label: "Elastic tape", categoryId: "trims", productId: "trim-elastic-1" },
  { keys: ["thread", "धागा"], label: "Sewing thread", categoryId: "trims", productId: "trim-thread-cone" },
  {
    keys: ["courier bag", "polybag", "कूरियर बैग"],
    label: "Courier bag",
    categoryId: "packaging",
    productId: "pack-courier-bag",
  },
  { keys: ["box", "carton", "बॉक्स"], label: "Corrugated box", categoryId: "packaging", productId: "pack-box-3ply" },
  { keys: ["label", "लेबल"], label: "Garment label", categoryId: "packaging", productId: "pack-label-woven" },
  { keys: ["bead", "मोती"], label: "Beads", categoryId: "jewellery", productId: "jwl-beads-glass" },
  { keys: ["chain", "चेन"], label: "Chain", categoryId: "jewellery", productId: "jwl-chain-brass" },
  { keys: ["clasp", "हुक"], label: "Clasp", categoryId: "jewellery", productId: "jwl-clasp-lobster" },
];

const COLOURS: { keys: string[]; label: string }[] = [
  { keys: ["black", "kala", "काला", "ब्लैक"], label: "Black" },
  { keys: ["white", "safed", "सफ़ेद", "सफेद"], label: "White" },
  { keys: ["off white", "offwhite"], label: "Off white" },
  { keys: ["navy"], label: "Navy" },
  { keys: ["blue", "neela", "नीला"], label: "Blue" },
  { keys: ["red", "lal", "लाल"], label: "Red" },
  { keys: ["grey", "gray", "ग्रे"], label: "Grey" },
  { keys: ["gold", "गोल्ड"], label: "Gold tone" },
];

const CITIES = ["delhi", "दिल्ली", "noida", "gurugram", "mumbai", "surat", "jaipur", "ludhiana"];

export const SAMPLE_VOICE_TEXT =
  "Mujhe 100 metre black cotton jersey chahiye, 180 GSM, 60 inch width, Delhi delivery, 10 din ke andar.";

export function parseRequirement(input: string): ParsedRequirement {
  const text = input.toLowerCase();
  const out: ParsedRequirement = { understood: false, questions: [] };

  // quantity + unit
  const qtyMatch =
    text.match(/(\d[\d,]*)\s*(metre|meter|meters|metres|mtr|m\b|मीटर|मी\b)/) ||
    text.match(/(\d[\d,]*)\s*(piece|pieces|pcs|pc\b|नग)/) ||
    text.match(/(\d[\d,]*)\s*(pack|packs|cone|cones)/) ||
    text.match(/(\d[\d,]*)\s*(?=\s*(?:black|white|cotton|कॉटन))/);
  if (qtyMatch) {
    out.qty = parseInt(qtyMatch[1]!.replace(/,/g, ""), 10);
    const u = (qtyMatch[2] || "").toLowerCase();
    out.unit = u.startsWith("p") && !u.startsWith("pack") ? "pc" : u.startsWith("pack") ? "pack" : u.startsWith("cone") ? "cone" : "m";
  }

  for (const m of MATERIALS) {
    if (m.keys.some((k) => text.includes(k))) {
      out.material = m.label;
      out.categoryId = m.categoryId;
      out.matchedProductId = m.productId;
      break;
    }
  }
  // Composition is only recorded when the buyer states it explicitly — "cotton" alone is a material family.
  const pct = text.match(/(\d{2,3})\s*%\s*(cotton|polyester|viscose|कॉटन)/);
  if (pct) out.composition = `${pct[1]}% ${pct[2] === "कॉटन" ? "cotton" : pct[2]}`;
  else if (/\bblend\b|ब्लेंड/.test(text)) out.composition = "Blend (ratio to confirm)";

  for (const c of COLOURS) {
    if (c.keys.some((k) => text.includes(k))) {
      out.colour = c.label;
      break;
    }
  }

  const gsm = text.match(/(\d{2,4})\s*gsm/);
  if (gsm) out.gsm = parseInt(gsm[1]!, 10);

  const width = text.match(/(\d{2,3})\s*(inch|in\b|"|इंच)/);
  if (width) out.widthIn = parseInt(width[1]!, 10);

  const city = CITIES.find((c) => text.includes(c));
  if (city) out.destination = city === "दिल्ली" ? "Delhi" : city.charAt(0).toUpperCase() + city.slice(1);

  const days = text.match(/(\d{1,3})\s*(day|days|din|दिन)/);
  if (days) out.withinDays = parseInt(days[1]!, 10);

  out.understood = Boolean(out.material || out.qty);

  if (out.understood) {
    if (!out.qty) out.questions.push("qty");
    if (out.categoryId === "fabrics") {
      if (!out.composition) out.questions.push("composition");
      if (!out.gsm) out.questions.push("gsm");
      if (!out.widthIn) out.questions.push("width");
      out.questions.push("finish");
    }
    if (!out.colour) out.questions.push("colour");
    if (!out.destination) out.questions.push("destination");
    if (!out.withinDays) out.questions.push("neededBy");
  }

  return out;
}

/** Specification-compatible catalogue matches, with delivery feasibility. */
export function findMatches(
  parsed: ParsedRequirement,
): { product: Product; reasonsEn: string[]; reasonsHi: string[]; feasible: boolean }[] {
  if (!parsed.material) return [];
  return PRODUCTS.filter((p) => p.categoryId === parsed.categoryId)
    .map((p) => {
      const reasonsEn: string[] = [];
      const reasonsHi: string[] = [];
      let score = 0;
      if (parsed.matchedProductId === p.id) score += 3;
      let specOk = true;
      if (parsed.gsm && p.match.gsm) {
        if (p.match.gsm === parsed.gsm) {
          score += 1;
          reasonsEn.push(`Specification: ${parsed.gsm} GSM matches`);
          reasonsHi.push(`स्पेसिफ़िकेशन: ${parsed.gsm} GSM मेल खाता है`);
        } else {
          specOk = false;
          reasonsEn.push(`Rejected: ${p.match.gsm} GSM ≠ requested ${parsed.gsm} GSM`);
          reasonsHi.push(`अस्वीकृत: ${p.match.gsm} GSM, माँगा ${parsed.gsm} GSM`);
        }
      }
      if (parsed.widthIn && p.match.widthIn) {
        if (p.match.widthIn === parsed.widthIn) {
          score += 1;
          reasonsEn.push(`Specification: ${parsed.widthIn}" width matches`);
          reasonsHi.push(`स्पेसिफ़िकेशन: ${parsed.widthIn}" चौड़ाई मेल खाती है`);
        } else {
          specOk = false;
          reasonsEn.push(`Rejected: width mismatch (${p.match.widthIn}" vs ${parsed.widthIn}")`);
          reasonsHi.push(`अस्वीकृत: चौड़ाई मेल नहीं (${p.match.widthIn}" बनाम ${parsed.widthIn}")`);
        }
      }
      if (parsed.colour && p.match.colour === parsed.colour.toLowerCase()) {
        score += 1;
        reasonsEn.push(`${parsed.colour} colour matches`);
        reasonsHi.push(`${parsed.colour} रंग मेल खाता है`);
      }
      if (parsed.qty && p.buyNow) {
        const ok = parsed.qty >= p.buyNow.minQty && parsed.qty <= p.buyNow.maxQty;
        reasonsEn.push(
          ok
            ? `Quantity: ${parsed.qty} ${p.unit} fits ${p.buyNow.minQty}–${p.buyNow.maxQty}`
            : `Quantity: ${parsed.qty} ${p.unit} outside ${p.buyNow.minQty}–${p.buyNow.maxQty}`,
        );
        reasonsHi.push(`मात्रा: ${parsed.qty} ${p.unit} (${p.buyNow.minQty}–${p.buyNow.maxQty})`);
        if (ok) {
          const delivered = (p.buyNow.unitPricePaise * parsed.qty + p.buyNow.deliveryPaise) / 100;
          reasonsEn.push(`Delivered cost: ₹${delivered.toLocaleString("en-IN")} before tax (buy now)`);
          reasonsHi.push(`डिलीवर्ड लागत: ₹${delivered.toLocaleString("en-IN")} टैक्स से पहले`);
        }
      }
      const lead = p.buyNow?.leadDays ?? 7;
      const feasible = specOk && (parsed.withinDays ? lead <= parsed.withinDays : true);
      if (feasible) {
        reasonsEn.push(`Estimated delivery in ${lead} days meets your date`);
        reasonsHi.push(`अनुमानित ${lead} दिन की डिलीवरी आपकी तारीख़ पूरी करती है`);
      } else {
        reasonsEn.push(`Estimated ${lead} days — later than your required date`);
        reasonsHi.push(`अनुमानित ${lead} दिन — आपकी ज़रूरी तारीख़ के बाद`);
      }
      return { product: p, reasonsEn, reasonsHi, feasible, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ product, reasonsEn, reasonsHi, feasible }) => ({ product, reasonsEn, reasonsHi, feasible }));
}
