import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BadgeCheck, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { BatchProgress } from "@/components/app/ProductCard";
import { Screen } from "@/components/app/Shell";
import {
  Button,
  Card,
  Empty,
  MaterialTile,
  Note,
  Pill,
  Row,
  SectionTitle,
  Sheet,
} from "@/components/app/ui";
import { getProduct, getSupplier } from "@/lib/demo/catalog";
import { perUnit, priceQuote, rupees, savingsVsLocal } from "@/lib/demo/money";
import { actions } from "@/lib/demo/store";
import type { RouteQuote } from "@/lib/demo/types";
import { formatDate, useApp } from "@/lib/useApp";

export const Route = createFileRoute("/sourcing/product/$productId")({
  head: () => ({
    meta: [
      { title: "Material details — Meesho Sourcing concept" },
      {
        name: "description",
        content:
          "Full specifications, delivered quote, batch progress and supplier comparison for a raw material in the concept prototype.",
      },
      { property: "og:title", content: "Material details — Meesho Sourcing concept" },
      {
        property: "og:description",
        content: "Compare delivered options and join a pooled buying batch.",
      },
    ],
  }),
  component: ProductScreen,
});

function ProductScreen() {
  const { productId } = Route.useParams();
  const { s, t, lang } = useApp();
  const navigate = useNavigate();
  const product = getProduct(productId);
  const batch = s.batches.find((b) => b.id === product?.batchId);
  const batchOpen = batch?.status === "open";
  const [route, setRoute] = useState<"batch" | "buynow">(batchOpen ? "batch" : "buynow");
  const [qty, setQty] = useState(() => (batchOpen ? 100 : (product?.buyNow?.minQty ?? 100)));
  const [badgeOpen, setBadgeOpen] = useState(false);

  if (!product) {
    return (
      <Screen title={t("details")} back>
        <div className="p-4">
          <Empty>{t("none")}</Empty>
        </div>
      </Screen>
    );
  }

  const supplier = getSupplier(product.supplierId);
  const activeQuote: RouteQuote | null =
    route === "batch" && batch
      ? {
          unitPricePaise: batch.unitPricePaise,
          deliveryPaise: batch.deliveryPaise,
          minQty: batch.qtyRange[0],
          maxQty: batch.qtyRange[1],
          leadDays: batch.leadDays,
        }
      : product.buyNow;
  const pricing = activeQuote ? priceQuote(activeQuote, qty) : null;
  const step = route === "batch" && batch ? batch.stepQty : 10;
  const sample = s.samples.find((x) => x.productId === product.id);
  const sampleApproved = sample?.status === "approved";
  const needsSample = Boolean(product.requiresSampleApproval) && !sampleApproved;
  const saving =
    pricing && product.localQuotePaise ? savingsVsLocal(pricing, product.localQuotePaise) : null;

  const options = product.alternatives
    ? [
        {
          id: "meesho-batch",
          name: `${supplier.name} (${t("buyTogether")})`,
          city: supplier.city,
          unit: batch?.unitPricePaise ?? product.buyNow!.unitPricePaise,
          delivery: batch?.deliveryPaise ?? product.buyNow!.deliveryPaise,
          lead: batch?.leadDays ?? product.buyNow!.leadDays,
          noteEn: "Pooled batch price once the threshold is reached.",
          noteHi: "सीमा पूरी होने पर साझा बैच दाम।",
        },
        ...product.alternatives.map((a) => ({
          id: a.id,
          name: getSupplier(a.supplierId).name,
          city: getSupplier(a.supplierId).city,
          unit: a.unitPricePaise,
          delivery: a.deliveryPaise,
          lead: a.leadDays,
          noteEn: a.noteEn,
          noteHi: a.noteHi,
        })),
      ]
    : [];

  return (
    <Screen
      title={lang === "hi" ? product.nameHi : product.nameEn}
      back
      subtitle={t("soldByMeesho")}
      sticky={
        <div className="space-y-2">
          {!pricing ? <Note tone="warning">{t("outOfRange")}</Note> : null}
          {needsSample && route === "batch" ? <Note tone="warning">{t("sampleNeeded")}</Note> : null}
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <p className="num text-base font-bold text-foreground">
                {pricing ? rupees(pricing.totalPaise) : "—"}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {t("totalPayable")} · {qty} {product.unit}
              </p>
            </div>
            <Button
              disabled={!pricing || (needsSample && route === "batch")}
              onClick={() =>
                navigate({
                  to: "/checkout/$productId",
                  params: { productId: product.id },
                  search: { route, qty },
                })
              }
            >
              {route === "batch" ? t("joinBatch") : t("buyNow")}
            </Button>
          </div>
        </div>
      }
    >
      <MaterialTile swatch={product.image} label={product.nameEn} className="h-48 w-full rounded-none" />

      <div className="space-y-3 px-4 pt-3">
        <div>
          <h2 className="text-base font-bold text-foreground">
            {lang === "hi" ? product.nameHi : product.nameEn}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t("manufacturer")}: {supplier.name} · {t("shipsFrom")} {supplier.city}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            <Pill tone="brand">{t("soldByMeesho")}</Pill>
            {supplier.verifiedDemo ? (
              <button onClick={() => setBadgeOpen(true)} className="rounded-md">
                <Pill tone="positive">
                  <BadgeCheck className="h-3 w-3" aria-hidden /> {t("verifiedDemo")}
                </Pill>
              </button>
            ) : null}
          </div>
        </div>

        {/* route switch */}
        <div className="grid grid-cols-2 gap-2" role="group" aria-label={t("purchaseRoute")}>
          <button
            disabled={!batchOpen}
            onClick={() => {
              setRoute("batch");
              if (batch) setQty(Math.max(batch.minCommit, Math.min(qty, batch.qtyRange[1])));
            }}
            className={`tap rounded-xl border p-2 text-left text-xs ${
              route === "batch" ? "border-primary bg-primary-soft" : "border-border bg-card"
            } ${!batchOpen ? "opacity-50" : ""}`}
          >
            <span className="block font-bold text-foreground">{t("buyTogether")}</span>
            <span className="num block text-muted-foreground">
              {batch ? perUnit(batch.unitPricePaise, product.unit) : "—"}
            </span>
          </button>
          <button
            disabled={!product.buyNow}
            onClick={() => {
              setRoute("buynow");
              if (product.buyNow) setQty(Math.max(product.buyNow.minQty, qty));
            }}
            className={`tap rounded-xl border p-2 text-left text-xs ${
              route === "buynow" ? "border-primary bg-primary-soft" : "border-border bg-card"
            }`}
          >
            <span className="block font-bold text-foreground">{t("buyNow")}</span>
            <span className="num block text-muted-foreground">
              {product.buyNow ? perUnit(product.buyNow.unitPricePaise, product.unit) : "—"}
            </span>
          </button>
        </div>

        {/* quantity */}
        <Card>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground">{t("yourQty")}</p>
              <p className="text-[11px] text-muted-foreground">
                {activeQuote
                  ? `${activeQuote.minQty}–${activeQuote.maxQty} ${product.unit}`
                  : t("outOfRange")}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                aria-label="decrease"
                onClick={() => setQty((v) => Math.max(0, v - step))}
              >
                <Minus className="h-4 w-4" aria-hidden />
              </Button>
              <span className="num w-16 text-center text-sm font-bold text-foreground">
                {qty} {product.unit}
              </span>
              <Button variant="outline" size="sm" aria-label="increase" onClick={() => setQty((v) => v + step)}>
                <Plus className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>
          {pricing ? (
            <div className="mt-2 border-t border-border pt-2">
              <Row label={t("perUnitPrice")} value={rupees(pricing.materialPaise)} />
              <Row label={t("delivery")} value={rupees(pricing.deliveryPaise)} />
              <Row label={t("preTaxDelivered")} value={rupees(pricing.materialPaise + pricing.deliveryPaise)} strong />
              <Row label={t("demoTax")} value={rupees(pricing.taxPaise)} tone="muted" />
              <Row label={t("totalPayable")} value={rupees(pricing.totalPaise)} strong />
              {saving && saving.amount > 0 ? (
                <p className="mt-1 text-xs font-bold text-positive">
                  {t("savings")} {rupees(saving.amount)} ({saving.pct.toFixed(1)}%){" "}
                  <span className="font-normal text-muted-foreground">
                    {lang === "hi"
                      ? "आपके दर्ज लोकल रेट से, टैक्स से पहले डिलीवर्ड आधार पर"
                      : "vs your entered local quote, pre-tax delivered basis"}
                  </span>
                </p>
              ) : null}
            </div>
          ) : (
            <Note tone="warning">{t("outOfRange")}</Note>
          )}
          <p className="mt-2 text-[11px] text-muted-foreground">
            {t("deliveredEstimate")}:{" "}
            {activeQuote
              ? formatDate(
                  new Date(
                    new Date(s.demoNow).getTime() + activeQuote.leadDays * 86400000,
                  ).toISOString(),
                  lang,
                )
              : "—"}
          </p>
        </Card>

        {batch ? (
          <Card>
            <BatchProgress batch={batch} />
            <p className="mt-2 text-[11px] text-muted-foreground">{t("batchExplain")}</p>
            <p className="num mt-1 text-[11px] text-muted-foreground">
              {t("batchClosesOn")} {formatDate(batch.expiresAt, lang)} ·{" "}
              {batch.status !== "open" ? t(`stage_${batch.status === "confirmed" ? "confirmed" : "expired_refunded"}`) : ""}
            </p>
            <Note>{t("thresholdHelp")}</Note>
          </Card>
        ) : null}

        {product.requiresSampleApproval ? (
          <Card>
            <p className="text-xs font-bold text-foreground">{t("sampleStatus")}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Pill tone={sampleApproved ? "positive" : sample ? "warning" : "neutral"}>
                {sample ? t(`sample${sample.status.charAt(0).toUpperCase()}${sample.status.slice(1)}`) : t("none")}
              </Pill>
              {!sample || sample.status === "rejected" ? (
                <Button size="sm" variant="outline" onClick={() => actions.requestSample(product.id)}>
                  {t("requestSample")}
                </Button>
              ) : null}
              {sample?.status === "received" ? (
                <>
                  <Button size="sm" variant="positive" onClick={() => actions.decideSample(sample.id, true)}>
                    {t("approveSample")}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => actions.decideSample(sample.id, false)}>
                    {t("rejectSample")}
                  </Button>
                </>
              ) : null}
            </div>
            {sample?.note ? <p className="mt-1 text-[11px] text-muted-foreground">{sample.note}</p> : null}
          </Card>
        ) : null}
      </div>

      <SectionTitle>{t("specifications")}</SectionTitle>
      <div className="px-4">
        <Card>
          {product.specs.map((sp) => (
            <Row key={sp.key} label={lang === "hi" ? sp.labelHi : sp.labelEn} value={sp.value} />
          ))}
          {product.match.gsm ? <Note>{t("gsmHelp")}</Note> : null}
        </Card>
      </div>

      {options.length ? (
        <>
          <SectionTitle>{t("compareOptions")}</SectionTitle>
          <div className="space-y-2 px-4">
            <Note>{t("compareHint")}</Note>
            {options.map((o) => {
              const delivered = o.unit * qty + o.delivery;
              return (
                <Card key={o.id}>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-foreground">{o.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {t("shipsFrom")} {o.city} · {o.lead} {lang === "hi" ? "दिन" : "days"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="num text-xs font-semibold text-foreground">
                        {perUnit(o.unit, product.unit)}
                      </p>
                      <p className="num text-[11px] text-muted-foreground">
                        + {rupees(o.delivery)} {t("delivery").toLowerCase()}
                      </p>
                    </div>
                  </div>
                  <Row label={t("preTaxDelivered")} value={rupees(delivered)} strong />
                  <p className="text-[11px] text-muted-foreground">{lang === "hi" ? o.noteHi : o.noteEn}</p>
                </Card>
              );
            })}
            <Note>
              {lang === "hi"
                ? "लोकल रेट आपका दर्ज किया डेमो आँकड़ा है — स्वतंत्र रूप से सत्यापित बाज़ार भाव नहीं।"
                : "The local figure is your entered demo quote — not an independently verified market price."}
            </Note>
          </div>
        </>
      ) : null}

      <div className="h-6" />

      <Sheet open={badgeOpen} onClose={() => setBadgeOpen(false)} title={t("verifiedDemo")}>
        <p className="text-xs text-muted-foreground">{t("verifiedDemoBody")}</p>
      </Sheet>
    </Screen>
  );
}
