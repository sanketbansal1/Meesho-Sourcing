import { Link } from "@tanstack/react-router";
import { getSupplier } from "@/lib/demo/catalog";
import { perUnit } from "@/lib/demo/money";
import type { Batch, Product } from "@/lib/demo/types";
import { useApp } from "@/lib/useApp";
import { MaterialTile, Pill } from "./ui";

export function BatchProgress({ batch }: { batch: Batch }) {
  const { t, lang } = useApp();
  const pct = Math.min(100, Math.round((batch.committedQty / batch.thresholdQty) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] font-semibold text-foreground">
        <span>{t("batchProgress")}</span>
        <span className="num">
          {batch.committedQty.toLocaleString("en-IN")}/{batch.thresholdQty.toLocaleString("en-IN")}{" "}
          {batch.productId.startsWith("pack") ? "pc" : "m"}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t("batchProgress")}
        className="mt-1 h-2 w-full overflow-hidden rounded-full bg-secondary"
      >
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        {batch.participants} {lang === "hi" ? "व्यवसाय जुड़े" : "businesses joined"} ·{" "}
        {t("batchThresholdNote")} {batch.thresholdQty.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

export function shortSpecs(product: Product): string {
  const pick = ["gsm", "composition", "width", "length", "size", "material"];
  return product.specs
    .filter((sp) => pick.includes(sp.key))
    .slice(0, 3)
    .map((sp) => sp.value)
    .join(" · ");
}

export function daysUntil(fromIso: string, toIso: string): number {
  return Math.max(0, Math.ceil((new Date(toIso).getTime() - new Date(fromIso).getTime()) / 86400000));
}

export function ProductCard({ product, batch }: { product: Product; batch?: Batch }) {
  const { s, t, lang } = useApp();
  const sup = getSupplier(product.supplierId);
  const hi = lang === "hi";
  if (batch) {
    const left = Math.max(0, batch.thresholdQty - batch.committedQty);
    const pct = Math.min(100, Math.round((batch.committedQty / batch.thresholdQty) * 100));
    const closes = daysUntil(s.demoNow, batch.expiresAt);
    const isCanonical = product.id === "fab-jersey-black";
    return (
      <Link
        to="/sourcing/product/$productId"
        params={{ productId: product.id }}
        search={{ route: "batch" }}
        className="flex h-full flex-col rounded-xl border border-border bg-card p-2 shadow-app"
      >
        <MaterialTile swatch={product.image} label={product.nameEn} className="aspect-square w-full" />
        <div className="mt-2 flex flex-1 flex-col gap-1">
          <p className="line-clamp-2 min-h-[2.2rem] text-xs font-semibold text-foreground">
            {hi ? product.nameHi : product.nameEn}
          </p>
          <p className="line-clamp-1 text-[11px] text-muted-foreground">{shortSpecs(product)}</p>
          <p className="num text-sm font-bold text-foreground">
            {perUnit(batch.unitPricePaise, product.unit)}{" "}
            <span className="text-[10px] font-medium text-muted-foreground">{hi ? "मटीरियल" : "material"}</span>
          </p>
          {isCanonical ? (
            <p className="num text-[10px] text-muted-foreground">
              {hi ? "100 मी के लिए: ₹10,000 डिलीवर्ड, टैक्स से पहले" : "For 100 m: ₹10,000 delivered, before tax"}
            </p>
          ) : null}
          <p className="truncate text-[11px] text-muted-foreground">
            {t("shipsFrom")} {sup.city}
          </p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary" aria-hidden>
            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
          <p className="num text-[10px] text-foreground">
            {batch.committedQty.toLocaleString("en-IN")}/{batch.thresholdQty.toLocaleString("en-IN")} {product.unit} ·{" "}
            <span className="font-semibold text-primary">
              {left.toLocaleString("en-IN")} {product.unit} {hi ? "बाकी" : "left to confirm"}
            </span>
          </p>
          <p className="text-[10px] text-muted-foreground">
            {hi
              ? `${closes} दिन में बंद · पक्का होने पर ~${batch.leadDays} दिन में डिलीवरी`
              : `Closes in ${closes} days · ~${batch.leadDays} days delivery if confirmed`}
          </p>
          <span className="mt-auto pt-1 text-center text-xs font-semibold text-primary">
            {hi ? "बैच देखें →" : "View batch →"}
          </span>
        </div>
      </Link>
    );
  }
  const unitPaise = product.buyNow?.unitPricePaise;
  return (
    <Link
      to="/sourcing/product/$productId"
      params={{ productId: product.id }}
      search={{ route: "buynow" }}
      className="flex h-full flex-col rounded-xl border border-border bg-card p-2 shadow-app"
    >
      <MaterialTile swatch={product.image} label={product.nameEn} className="aspect-square w-full" />
      <div className="mt-2 flex flex-1 flex-col gap-1">
        <p className="line-clamp-2 min-h-[2.2rem] text-xs font-semibold text-foreground">
          {hi ? product.nameHi : product.nameEn}
        </p>
        <p className="line-clamp-1 text-[11px] text-muted-foreground">{shortSpecs(product)}</p>
        {unitPaise ? (
          <p className="num text-sm font-bold text-foreground">{perUnit(unitPaise, product.unit)}</p>
        ) : null}
        <p className="truncate text-[11px] text-muted-foreground">
          {t("shipsFrom")} {sup.city} · {product.buyNow?.leadDays} {hi ? "दिन" : "days"}
        </p>
        <span className="mt-auto pt-1 text-center text-xs font-semibold text-primary">
          {t("buyNow")} →
        </span>
      </div>
    </Link>
  );
}
