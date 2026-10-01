import type { DemoState } from "./types";

export const STATE_VERSION = 1;

/** Fixed demo clock so every date in the prototype stays coherent. */
export const DEMO_START = "2026-03-02T09:00:00.000Z";

export function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

export function createSeedState(): DemoState {
  const now = DEMO_START;
  return {
    version: STATE_VERSION,
    lang: "en",
    role: "seller",
    demoNow: now,
    seenIntro: false,
    tour: { active: false, step: 0 },
    batches: [
      {
        id: "batch-jersey",
        productId: "fab-jersey-black",
        thresholdQty: 1000,
        committedQty: 900,
        participants: 9,
        unitPricePaise: 9600,
        deliveryPaise: 40000,
        minCommit: 50,
        stepQty: 10,
        qtyRange: [50, 200],
        leadDays: 7,
        expiresAt: addDays(now, 2),
        status: "open",
      },
      {
        id: "batch-lining",
        productId: "fab-poly-lining",
        thresholdQty: 2000,
        committedQty: 420,
        participants: 4,
        unitPricePaise: 5600,
        deliveryPaise: 30000,
        minCommit: 50,
        stepQty: 10,
        qtyRange: [50, 400],
        leadDays: 9,
        expiresAt: addDays(now, 2),
        status: "open",
      },
      {
        id: "batch-bag",
        productId: "pack-courier-bag",
        thresholdQty: 20000,
        committedQty: 9500,
        participants: 6,
        unitPricePaise: 190,
        deliveryPaise: 25000,
        minCommit: 200,
        stepQty: 100,
        qtyRange: [200, 5000],
        leadDays: 8,
        expiresAt: addDays(now, 3),
        status: "open",
      },
    ],
    samples: [
      {
        id: "smp-1",
        productId: "fab-jersey-black",
        status: "approved",
        requestedAt: addDays(now, -12),
        decidedAt: addDays(now, -6),
        note: "Swatch received and approved by Aarav. Hand feel and shade accepted.",
      },
    ],
    orders: [],
    requirements: [],
    quotes: [],
    pos: [],
    credit: {
      limitPaise: 2500000,
      reservedPaise: 0,
      outstandingPaise: 0,
      repaidPaise: 0,
      dueAt: null,
    },
    ledger: [],
    tickets: [],
    notifications: [
      {
        id: "ntf-seed-1",
        forRole: "seller",
        titleEn: "Batch for 180 GSM black cotton jersey is 900/1,000 m committed.",
        titleHi: "180 GSM काली कॉटन जर्सी का बैच 900/1,000 मी तक पहुँचा।",
        at: addDays(now, -1),
        read: false,
      },
      {
        id: "ntf-seed-2",
        forRole: "supplier",
        titleEn: "Combined demand from Delhi NCR is close to your 1,000 m threshold.",
        titleHi: "दिल्ली एनसीआर की संयुक्त माँग आपकी 1,000 मी सीमा के पास है।",
        at: addDays(now, -1),
        read: false,
      },
    ],
    settlementsProcessed: [],
  };
}

/** Marketplace side of the seller's business — illustrative, read-only. */
export const MARKETPLACE = {
  ordersToday: 14,
  ordersWeek: 96,
  pendingDispatch: 5,
  upcomingSettlementPaise: 800000,
  settlementDateOffsetDays: 3,
};
