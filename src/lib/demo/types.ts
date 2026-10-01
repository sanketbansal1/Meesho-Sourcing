// Shared typed data models for the Meesho Sourcing concept prototype.
// All money values are integers in paise.

export type Role = "seller" | "supplier";
export type Lang = "en" | "hi";

export type CategoryId = "fabrics" | "trims" | "packaging" | "jewellery";

export type Unit = "m" | "pc" | "pack" | "cone";

export interface Category {
  id: CategoryId;
  nameEn: string;
  nameHi: string;
  swatch: string; // css gradient token name
}

export interface SupplierInfo {
  id: string;
  name: string;
  city: string;
  state: string;
  verifiedDemo: boolean;
}

export interface SpecField {
  labelEn: string;
  labelHi: string;
  value: string;
  key: string;
}

export interface RouteQuote {
  unitPricePaise: number;
  deliveryPaise: number;
  minQty: number;
  maxQty: number;
  leadDays: number;
}

export interface AltOption {
  id: string;
  supplierId: string;
  unitPricePaise: number;
  deliveryPaise: number;
  leadDays: number;
  noteEn: string;
  noteHi: string;
}

export interface Product {
  id: string;
  categoryId: CategoryId;
  nameEn: string;
  nameHi: string;
  unit: Unit;
  supplierId: string;
  image: string;
  specs: SpecField[];
  // normalised fields used by search / matching
  match: {
    material?: string;
    colour?: string;
    gsm?: number;
    widthIn?: number;
    construction?: string;
  };
  buyNow: RouteQuote | null;
  batchId?: string;
  requiresSampleApproval?: boolean;
  alternatives?: AltOption[];
  localQuotePaise?: number; // seller-entered local reference, demo only
}

export type BatchStatus = "open" | "locked" | "confirmed" | "expired";

export interface Batch {
  id: string;
  productId: string;
  thresholdQty: number;
  committedQty: number;
  participants: number;
  unitPricePaise: number;
  deliveryPaise: number;
  minCommit: number;
  stepQty: number;
  qtyRange: [number, number];
  leadDays: number;
  expiresAt: string; // ISO
  status: BatchStatus;
}

export type SampleStatus = "none" | "requested" | "received" | "approved" | "rejected";

export interface SampleRecord {
  id: string;
  productId: string;
  status: SampleStatus;
  requestedAt: string;
  decidedAt?: string;
  note?: string;
}

export type OrderStage =
  | "awaiting_batch"
  | "confirmed"
  | "preparation"
  | "quality_check"
  | "dispatched"
  | "delivered"
  | "received"
  | "expired_refunded";

export interface Pricing {
  qty: number;
  unitPricePaise: number;
  materialPaise: number;
  deliveryPaise: number;
  taxPaise: number;
  totalPaise: number;
}

export interface SourcingOrder {
  id: string;
  productId: string;
  productName: string;
  route: "batch" | "buynow";
  batchId?: string;
  pricing: Pricing;
  payment: "paynow" | "credit";
  stage: OrderStage;
  createdAt: string;
  etaAt: string;
  dispatchRef?: string;
  issueTicketId?: string;
  refunded?: boolean;
}

export interface Requirement {
  id: string;
  productHint: string;
  categoryId: CategoryId;
  qty: number;
  unit: Unit;
  specs: Record<string, string>;
  destination: string;
  neededByAt: string;
  createdAt: string;
  status: "open" | "quoted" | "closed";
  source: "form" | "assistant";
}

export interface SupplierQuote {
  id: string;
  requirementId: string;
  supplierId: string;
  unitPricePaise: number;
  deliveryPaise: number;
  minQty: number;
  maxQty: number;
  leadDays: number;
  expiresAt: string;
  dispatchCity: string;
  sampleAvailable: boolean;
  status: "new" | "reviewed" | "declined";
  createdAt: string;
}

export interface SupplierPO {
  id: string;
  batchId: string;
  productId: string;
  totalQty: number;
  unitPricePaise: number;
  participants: number;
  allocations: { business: string; city: string; qty: number }[];
  acknowledged: boolean;
  preparation: "not_started" | "in_progress" | "ready";
  dispatchRef?: string;
  paymentStatus: "scheduled" | "part_paid" | "paid";
  createdAt: string;
}

export interface Credit {
  limitPaise: number;
  reservedPaise: number;
  outstandingPaise: number;
  repaidPaise: number;
  dueAt: string | null;
}

export interface LedgerEntry {
  id: string;
  kind: "settlement" | "repayment" | "payout" | "credit_drawn" | "credit_released" | "refund";
  amountPaise: number;
  at: string;
  note: string;
  refId?: string;
}

export interface Ticket {
  id: string;
  orderId: string;
  issueType: "shortage" | "quality" | "wrong_spec" | "damage";
  qty: number;
  description: string;
  hasPhoto: boolean;
  status: "open" | "under_review" | "resolved_partial" | "closed";
  resolution?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  forRole: Role | "both";
  titleEn: string;
  titleHi: string;
  at: string;
  read: boolean;
}

export interface DemoState {
  version: number;
  lang: Lang;
  role: Role;
  demoNow: string;
  seenIntro: boolean;
  tour: { active: boolean; step: number };
  batches: Batch[];
  samples: SampleRecord[];
  orders: SourcingOrder[];
  requirements: Requirement[];
  quotes: SupplierQuote[];
  pos: SupplierPO[];
  credit: Credit;
  ledger: LedgerEntry[];
  tickets: Ticket[];
  notifications: AppNotification[];
  settlementsProcessed: string[];
}
