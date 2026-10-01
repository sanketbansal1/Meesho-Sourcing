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

export function ProductCard({ product, batch }: { product: Product; batch?: Batch }) {
  const { t, lang } = useApp();
  const sup = getSupplier(product.supplierId);
  const unitPaise = batch ? batch.unitPricePaise : product.buyNow?.unitPricePaise;
  return (
    <Link
      to="/sourcing/product/$productId"
      params={{ productId: product.id }}
      className="block rounded-xl border border-border bg-card p-2 shadow-app"
    >
      <MaterialTile swatch={product.image} label={product.nameEn} className="h-28 w-full" />
      <div className="mt-2 space-y-1">
        <p className="line-clamp-2 min-h-[2.2rem] text-xs font-semibold text-foreground">
          {lang === "hi" ? product.nameHi : product.nameEn}
        </p>
        {unitPaise ? (
          <p className="num text-sm font-bold text-foreground">{perUnit(unitPaise, product.unit)}</p>
        ) : null}
        <p className="truncate text-[11px] text-muted-foreground">
          {t("shipsFrom")} {sup.city}
        </p>
        <div className="flex flex-wrap gap-1 pt-0.5">
          {batch ? <Pill tone="brand">{t("buyTogether")}</Pill> : null}
          {product.buyNow ? <Pill tone="neutral">{t("buyNow")}</Pill> : null}
        </div>
      </div>
    </Link>
  );
}
