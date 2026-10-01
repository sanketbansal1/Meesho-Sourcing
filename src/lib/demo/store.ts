import { useSyncExternalStore } from "react";
import { getProduct } from "./catalog";
import { priceQuote } from "./money";
import { addDays, createSeedState, STATE_VERSION } from "./seed";
import type {
  AppNotification,
  Batch,
  DemoState,
  Lang,
  OrderStage,
  Requirement,
  Role,
  SourcingOrder,
  SupplierQuote,
  Ticket,
} from "./types";

const KEY = "meesho-sourcing-demo-v1";

let state: DemoState = createSeedState();
let hydrated = false;
const listeners = new Set<() => void>();
const serverState: DemoState = createSeedState();

function load(): DemoState {
  if (typeof window === "undefined") return createSeedState();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return createSeedState();
    const parsed = JSON.parse(raw) as DemoState;
    if (parsed.version !== STATE_VERSION) return createSeedState();
    return parsed;
  } catch {
    return createSeedState();
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — demo still works in memory */
  }
}

function emit() {
  persist();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  if (!hydrated) {
    hydrated = true;
    state = load();
  }
  listeners.add(l);
  return () => listeners.delete(l);
}

function getSnapshot() {
  return state;
}
function getServerSnapshot() {
  return serverState;
}

export function useDemo(): DemoState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function set(updater: (s: DemoState) => DemoState | void) {
  const draft: DemoState = JSON.parse(JSON.stringify(state));
  const result = updater(draft);
  state = (result ?? draft) as DemoState;
  emit();
}

let counter = 0;
function uid(prefix: string) {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}${counter}`;
}

function notify(s: DemoState, forRole: Role | "both", titleEn: string, titleHi: string) {
  const n: AppNotification = {
    id: uid("ntf"),
    forRole,
    titleEn,
    titleHi,
    at: s.demoNow,
    read: false,
  };
  s.notifications.unshift(n);
}

export function availableCredit(s: DemoState): number {
  return Math.max(0, s.credit.limitPaise - s.credit.reservedPaise - s.credit.outstandingPaise);
}

export const ORDER_FLOW: OrderStage[] = [
  "awaiting_batch",
  "confirmed",
  "preparation",
  "quality_check",
  "dispatched",
  "delivered",
  "received",
];

/* ------------------------------------------------------------------ */
/* Actions                                                             */
/* ------------------------------------------------------------------ */

export const actions = {
  setLang(lang: Lang) {
    set((s) => {
      s.lang = lang;
    });
  },
  setRole(role: Role) {
    set((s) => {
      s.role = role;
    });
  },
  markIntroSeen() {
    set((s) => {
      s.seenIntro = true;
    });
  },
  startTour() {
    set((s) => {
      s.tour = { active: true, step: 0 };
      s.seenIntro = true;
    });
  },
  setTourStep(step: number) {
    set((s) => {
      s.tour = { active: true, step };
    });
  },
  endTour() {
    set((s) => {
      s.tour = { active: false, step: 0 };
    });
  },
  readNotifications(role: Role) {
    set((s) => {
      s.notifications.forEach((n) => {
        if (n.forRole === role || n.forRole === "both") n.read = true;
      });
    });
  },

  /* --- samples --- */
  requestSample(productId: string) {
    set((s) => {
      const existing = s.samples.find((x) => x.productId === productId);
      if (existing && existing.status !== "rejected") return;
      s.samples.push({
        id: uid("smp"),
        productId,
        status: "requested",
        requestedAt: s.demoNow,
      });
      notify(s, "seller", "Sample requested from the material supplier.", "मटीरियल सप्लायर से सैंपल माँगा गया।");
    });
  },
  receiveSample(sampleId: string) {
    set((s) => {
      const smp = s.samples.find((x) => x.id === sampleId);
      if (!smp || smp.status !== "requested") return;
      smp.status = "received";
      notify(s, "seller", "Sample delivered. Please approve or reject.", "सैंपल आ गया। कृपया मंज़ूर या अस्वीकार करें।");
    });
  },
  decideSample(sampleId: string, approve: boolean) {
    set((s) => {
      const smp = s.samples.find((x) => x.id === sampleId);
      if (!smp || smp.status !== "received") return;
      smp.status = approve ? "approved" : "rejected";
      smp.decidedAt = s.demoNow;
    });
  },

  /* --- ordering --- */
  placeOrder(input: {
    productId: string;
    route: "batch" | "buynow";
    qty: number;
    payment: "paynow" | "credit";
  }): { ok: true; orderId: string } | { ok: false; reason: string } {
    const product = getProduct(input.productId);
    if (!product) return { ok: false, reason: "unknown_product" };
    const s0 = state;
    const batch = input.route === "batch" ? s0.batches.find((b) => b.id === product.batchId) : undefined;

    const quote =
      input.route === "batch" && batch
        ? {
            unitPricePaise: batch.unitPricePaise,
            deliveryPaise: batch.deliveryPaise,
            minQty: batch.qtyRange[0],
            maxQty: batch.qtyRange[1],
            leadDays: batch.leadDays,
          }
        : product.buyNow;
    if (!quote) return { ok: false, reason: "no_quote" };
    if (input.route === "batch" && (!batch || batch.status !== "open"))
      return { ok: false, reason: "batch_closed" };

    const pricing = priceQuote(quote, input.qty);
    if (!pricing) return { ok: false, reason: "out_of_range" };

    if (product.requiresSampleApproval) {
      const smp = s0.samples.find((x) => x.productId === product.id && x.status === "approved");
      if (!smp) return { ok: false, reason: "sample_required" };
    }
    if (input.payment === "credit" && pricing.totalPaise > availableCredit(s0))
      return { ok: false, reason: "insufficient_credit" };

    const orderId = uid("SRC");
    set((s) => {
      const b = s.batches.find((x) => x.id === batch?.id);
      let stage: OrderStage = "confirmed";
      let etaDays = quote.leadDays;

      if (b) {
        b.committedQty += input.qty;
        b.participants += 1;
        if (b.committedQty >= b.thresholdQty) {
          b.status = "confirmed";
          stage = "confirmed";
        } else {
          b.status = "open";
          stage = "awaiting_batch";
        }
        etaDays = b.leadDays;
      }

      const order: SourcingOrder = {
        id: orderId,
        productId: product.id,
        productName: product.nameEn,
        route: input.route,
        batchId: b?.id,
        pricing,
        payment: input.payment,
        stage,
        createdAt: s.demoNow,
        etaAt: addDays(s.demoNow, etaDays),
      };
      s.orders.unshift(order);

      if (input.payment === "credit") {
        if (stage === "awaiting_batch") {
          s.credit.reservedPaise += pricing.totalPaise;
          s.ledger.unshift({
            id: uid("led"),
            kind: "credit_drawn",
            amountPaise: pricing.totalPaise,
            at: s.demoNow,
            note: `Credit reserved for ${orderId} while the batch fills`,
            refId: orderId,
          });
        } else {
          s.credit.outstandingPaise += pricing.totalPaise;
          s.credit.dueAt = addDays(s.demoNow, 30);
          s.ledger.unshift({
            id: uid("led"),
            kind: "credit_drawn",
            amountPaise: pricing.totalPaise,
            at: s.demoNow,
            note: `Sourcing credit used for ${orderId}`,
            refId: orderId,
          });
        }
      }

      if (b && b.status === "confirmed") {
        confirmBatchInternal(s, b, orderId);
      }

      notify(
        s,
        "seller",
        `Sourcing order ${orderId} created.`,
        `सोर्सिंग ऑर्डर ${orderId} बन गया।`,
      );
    });
    return { ok: true, orderId };
  },

  advanceFulfilment(orderId: string) {
    set((s) => {
      const o = s.orders.find((x) => x.id === orderId);
      if (!o || o.stage === "expired_refunded") return;
      const idx = ORDER_FLOW.indexOf(o.stage);
      if (idx < 0 || idx >= ORDER_FLOW.length - 2) return; // "received" is a seller action
      const next = ORDER_FLOW[idx + 1];
      if (next === "confirmed" && o.route === "batch") {
        const b = s.batches.find((x) => x.id === o.batchId);
        if (b && b.status !== "confirmed") return; // can't confirm before the batch fills
      }
      o.stage = next;
      if (next === "dispatched") {
        o.dispatchRef = `MSD-${o.id.slice(-5).toUpperCase()}`;
        const po = s.pos.find((p) => p.batchId === o.batchId);
        if (po) po.dispatchRef = o.dispatchRef;
      }
      notify(s, "both", `${o.id}: status is now ${next.replace("_", " ")}.`, `${o.id}: स्थिति अब ${next.replace("_", " ")}।`);
    });
  },

  confirmReceived(orderId: string) {
    set((s) => {
      const o = s.orders.find((x) => x.id === orderId);
      if (o && o.stage === "delivered") o.stage = "received";
    });
  },

  expireBatch(batchId: string) {
    set((s) => {
      const b = s.batches.find((x) => x.id === batchId);
      if (!b || b.status !== "open") return;
      b.status = "expired";
      s.orders
        .filter((o) => o.batchId === b.id && o.stage === "awaiting_batch")
        .forEach((o) => {
          o.stage = "expired_refunded";
          o.refunded = true;
          if (o.payment === "credit") {
            s.credit.reservedPaise = Math.max(0, s.credit.reservedPaise - o.pricing.totalPaise);
            s.ledger.unshift({
              id: uid("led"),
              kind: "credit_released",
              amountPaise: o.pricing.totalPaise,
              at: s.demoNow,
              note: `Reserved credit released — batch did not fill (${o.id})`,
              refId: o.id,
            });
          } else {
            s.ledger.unshift({
              id: uid("led"),
              kind: "refund",
              amountPaise: o.pricing.totalPaise,
              at: s.demoNow,
              note: `Simulated refund — batch did not fill (${o.id})`,
              refId: o.id,
            });
          }
        });
      notify(
        s,
        "seller",
        "A batch did not reach its threshold. Your commitment was cancelled in full.",
        "एक बैच अपनी सीमा तक नहीं पहुँचा। आपकी बुकिंग पूरी तरह रद्द कर दी गई।",
      );
    });
  },

  simulateSettlement(grossPaise = 800000) {
    set((s) => {
      const id = `STL-${s.settlementsProcessed.length + 1}`;
      if (s.settlementsProcessed.includes(id)) return;
      s.settlementsProcessed.push(id);
      const eligible = Math.max(0, grossPaise);
      const deduction = eligible > 0 ? Math.min(Math.round(eligible * 0.2), s.credit.outstandingPaise) : 0;
      const payout = eligible - deduction;
      s.credit.outstandingPaise -= deduction;
      s.credit.repaidPaise += deduction;
      if (s.credit.outstandingPaise === 0) s.credit.dueAt = null;
      s.ledger.unshift(
        {
          id: uid("led"),
          kind: "payout",
          amountPaise: payout,
          at: s.demoNow,
          note: `Amount you receive from ${id}`,
          refId: id,
        },
        {
          id: uid("led"),
          kind: "repayment",
          amountPaise: deduction,
          at: s.demoNow,
          note: `Credit repayment deducted from ${id} (20% of eligible settlement)`,
          refId: id,
        },
        {
          id: uid("led"),
          kind: "settlement",
          amountPaise: eligible,
          at: s.demoNow,
          note: `Eligible net sales settlement ${id}`,
          refId: id,
        },
      );
      notify(
        s,
        "seller",
        `Settlement ${id} processed. Repayment deducted from sales.`,
        `सेटलमेंट ${id} प्रोसेस हुआ। बिक्री से किश्त कटी।`,
      );
    });
  },

  repayNow(amountPaise: number) {
    set((s) => {
      const amt = Math.min(Math.max(0, Math.round(amountPaise)), s.credit.outstandingPaise);
      if (amt <= 0) return;
      s.credit.outstandingPaise -= amt;
      s.credit.repaidPaise += amt;
      if (s.credit.outstandingPaise === 0) s.credit.dueAt = null;
      s.ledger.unshift({
        id: uid("led"),
        kind: "repayment",
        amountPaise: amt,
        at: s.demoNow,
        note: "Manual repayment — simulated",
      });
    });
  },

  advanceDate(days: number) {
    set((s) => {
      s.demoNow = addDays(s.demoNow, days);
      s.batches.forEach((b) => {
        if (b.status === "open" && new Date(b.expiresAt) <= new Date(s.demoNow)) {
          b.status = "expired";
          s.orders
            .filter((o) => o.batchId === b.id && o.stage === "awaiting_batch")
            .forEach((o) => {
              o.stage = "expired_refunded";
              o.refunded = true;
              if (o.payment === "credit") {
                s.credit.reservedPaise = Math.max(0, s.credit.reservedPaise - o.pricing.totalPaise);
                s.ledger.unshift({
                  id: uid("led"),
                  kind: "credit_released",
                  amountPaise: o.pricing.totalPaise,
                  at: s.demoNow,
                  note: `Reserved credit released — batch expired (${o.id})`,
                });
              } else {
                s.ledger.unshift({
                  id: uid("led"),
                  kind: "refund",
                  amountPaise: o.pricing.totalPaise,
                  at: s.demoNow,
                  note: `Simulated refund — batch expired (${o.id})`,
                });
              }
            });
        }
      });
    });
  },

  /* --- requirements & quotes --- */
  submitRequirement(req: Omit<Requirement, "id" | "createdAt" | "status">) {
    const id = uid("REQ");
    set((s) => {
      s.requirements.unshift({ ...req, id, createdAt: s.demoNow, status: "open" });
      notify(
        s,
        "supplier",
        "New requirement received from a Delhi business.",
        "दिल्ली के एक व्यवसाय से नई माँग आई।",
      );
    });
    return id;
  },

  submitSupplierQuote(q: Omit<SupplierQuote, "id" | "createdAt" | "status">) {
    const id = uid("QT");
    set((s) => {
      s.quotes.unshift({ ...q, id, createdAt: s.demoNow, status: "new" });
      const req = s.requirements.find((r) => r.id === q.requirementId);
      if (req) req.status = "quoted";
      notify(
        s,
        "seller",
        "A material supplier sent a quote for your requirement.",
        "आपकी माँग पर एक मटीरियल सप्लायर ने कोटेशन भेजा।",
      );
    });
    return id;
  },

  markQuoteReviewed(quoteId: string) {
    set((s) => {
      const q = s.quotes.find((x) => x.id === quoteId);
      if (q) q.status = "reviewed";
    });
  },

  /* --- supplier order handling --- */
  acknowledgePO(poId: string) {
    set((s) => {
      const po = s.pos.find((p) => p.id === poId);
      if (po) po.acknowledged = true;
    });
  },
  setPOPreparation(poId: string, value: "not_started" | "in_progress" | "ready") {
    set((s) => {
      const po = s.pos.find((p) => p.id === poId);
      if (po) po.preparation = value;
    });
  },
  setPODispatch(poId: string, ref: string) {
    set((s) => {
      const po = s.pos.find((p) => p.id === poId);
      if (!po) return;
      po.dispatchRef = ref;
      po.paymentStatus = "part_paid";
      s.orders
        .filter((o) => o.batchId === po.batchId && o.stage === "quality_check")
        .forEach((o) => {
          o.stage = "dispatched";
          o.dispatchRef = ref;
        });
      notify(s, "seller", "Your material has been dispatched from Surat.", "आपका मटीरियल सूरत से भेज दिया गया।");
    });
  },

  /* --- issues --- */
  createTicket(t: Omit<Ticket, "id" | "createdAt" | "status">) {
    const id = uid("TKT");
    set((s) => {
      s.tickets.unshift({ ...t, id, createdAt: s.demoNow, status: "open" });
      const o = s.orders.find((x) => x.id === t.orderId);
      if (o) o.issueTicketId = id;
    });
    return id;
  },
  resolveTicket(ticketId: string) {
    set((s) => {
      const t = s.tickets.find((x) => x.id === ticketId);
      if (!t) return;
      if (t.status === "open") {
        t.status = "under_review";
        t.resolution = "Under review by the sourcing team — demo step.";
      } else if (t.status === "under_review") {
        t.status = "resolved_partial";
        t.resolution =
          "Demo resolution: affected quantity accepted for replacement in the next dispatch. Outcomes vary by case.";
      }
    });
  },

  reset() {
    state = createSeedState();
    emit();
  },
};

function confirmBatchInternal(s: DemoState, b: Batch, orderId: string) {
  const order = s.orders.find((o) => o.id === orderId);
  if (order && order.payment === "credit" && order.stage === "confirmed") {
    // reservation was never booked for an immediately-confirmed batch
  }
  // convert any reservations on this batch into outstanding debt
  s.orders
    .filter((o) => o.batchId === b.id && o.payment === "credit" && o.stage === "awaiting_batch")
    .forEach((o) => {
      s.credit.reservedPaise = Math.max(0, s.credit.reservedPaise - o.pricing.totalPaise);
      s.credit.outstandingPaise += o.pricing.totalPaise;
      s.credit.dueAt = addDays(s.demoNow, 30);
      o.stage = "confirmed";
    });
  s.orders
    .filter((o) => o.batchId === b.id && o.stage === "awaiting_batch")
    .forEach((o) => {
      o.stage = "confirmed";
    });

  if (s.pos.some((p) => p.batchId === b.id)) return;
  const sellerQty = s.orders
    .filter((o) => o.batchId === b.id)
    .reduce((sum, o) => sum + o.pricing.qty, 0);
  const otherQty = b.committedQty - sellerQty;
  const others = [
    { business: "Nirmal Garments", city: "Delhi", qty: 120 },
    { business: "Sai Creations", city: "Noida", qty: 110 },
    { business: "Bright Stitch", city: "Delhi", qty: 100 },
    { business: "Kavya Wear", city: "Ghaziabad", qty: 100 },
    { business: "Meera Apparels", city: "Delhi", qty: 100 },
    { business: "Taneja Textiles", city: "Faridabad", qty: 95 },
    { business: "Roshni Fashions", city: "Delhi", qty: 95 },
    { business: "Urban Thread", city: "Gurugram", qty: 90 },
    { business: "Ankit Enterprises", city: "Delhi", qty: 90 },
  ];
  const scale = otherQty / others.reduce((a, o) => a + o.qty, 0 || 1);
  const allocations = others.map((o) => ({ ...o, qty: Math.round(o.qty * (scale || 1)) }));
  allocations.unshift({ business: "Aarav Apparel", city: "Delhi", qty: sellerQty });

  s.pos.unshift({
    id: `PO-${b.id.toUpperCase().replace("BATCH-", "")}-001`,
    batchId: b.id,
    productId: b.productId,
    totalQty: b.committedQty,
    unitPricePaise: b.unitPricePaise,
    participants: b.participants,
    allocations,
    acknowledged: false,
    preparation: "not_started",
    paymentStatus: "scheduled",
    createdAt: s.demoNow,
  });
  notify(
    s,
    "supplier",
    "Consolidated purchase order received from Meesho.",
    "मीशो से संयुक्त परचेज़ ऑर्डर मिला।",
  );
}
