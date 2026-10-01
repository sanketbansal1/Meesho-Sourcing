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
  validateSearch: (search: Record<string, unknown>): { route?: "batch" | "buynow" } =>
    search.route === "batch" || search.route === "buynow" ? { route: search.route } : {},
  component: ProductScreen,
});

function ProductScreen() {
  const { productId } = Route.useParams();
  const { route: wanted } = Route.useSearch();
  const { s, t, lang } = useApp();
  const navigate = useNavigate();
  const product = getProduct(productId);
  const batch = s.batches.find((b) => b.id === product?.batchId);
  const batchOpen = batch?.status === "open";
  const initialRoute: "batch" | "buynow" =
    wanted === "buynow" && product?.buyNow ? "buynow" : batchOpen ? "batch" : "buynow";
  const [route, setRoute] = useState<"batch" | "buynow">(initialRoute);
  const [qty, setQty] = useState(() =>
    initialRoute === "batch" ? 100 : (product?.buyNow?.minQty ?? 100),
  );
  const [localQuote, setLocalQuote] = useState(() => String((product?.localQuotePaise ?? 0) / 100));
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
  const localPaise = Math.round((Number(localQuote) || 0) * 100);
  const saving = pricing && product.localQuotePaise && localPaise > 0 ? savingsVsLocal(pricing, localPaise) : null;
  const remaining = batch ? Math.max(0, batch.thresholdQty - batch.committedQty) : 0;

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
      <div className="relative">
        <MaterialTile swatch={product.image} label={product.nameEn} className="mx-auto aspect-square max-h-72 w-full rounded-none" />
        <span className="absolute bottom-2 right-2 rounded-md bg-card/90 px-2 py-0.5 text-[10px] text-muted-foreground">
          {lang === "hi" ? "चित्र सांकेतिक है" : "Illustrative image"}
        </span>
      </div>

      <div className="space-y-3 px-4 pt-3">
        <div>
          <h2 className="text-base font-bold text-foreground">
            {lang === "hi" ? product.nameHi : product.nameEn}
          </h2>
          <ul className="mt-1.5 flex flex-wrap gap-1" aria-label={t("specifications")}>
            {product.specs.slice(0, 4).map((sp) => (
              <li key={sp.key} className="rounded-md border border-border px-2 py-0.5 text-[11px] text-foreground">
                {sp.value}
              </li>
            ))}
          </ul>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {t("manufacturer")}: {supplier.name} · {t("shipsFrom")} {supplier.city}, {supplier.state}
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
            {batchOpen && route === "batch" ? (
              <div className="mt-2 rounded-lg bg-primary-soft p-2.5">
                <div className="flex h-3 w-full overflow-hidden rounded-full bg-card" aria-hidden>
                  <div className="h-full bg-primary/60" style={{ width: `${(batch.committedQty / batch.thresholdQty) * 100}%` }} />
                  <div
                    className="h-full bg-positive"
                    style={{ width: `${(Math.min(qty, batch.thresholdQty) / batch.thresholdQty) * 100}%` }}
                  />
                </div>
                <p className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>{lang === "hi" ? "दूसरे व्यवसाय" : "Other businesses"}: {batch.committedQty} {product.unit}</span>
                  <span className="font-semibold text-positive">{lang === "hi" ? "आपका हिस्सा" : "Your share"}: {qty} {product.unit}</span>
                </p>
                <p className="mt-1.5 text-xs text-foreground">
                  {qty >= remaining
                    ? lang === "hi"
                      ? `${batch.participants} व्यवसायों ने ${batch.committedQty} ${product.unit} तय किया है। आपके ${qty} ${product.unit} से ${batch.thresholdQty.toLocaleString("en-IN")} ${product.unit} का बैच पूरा होता है। हर व्यवसाय को अपनी मात्रा मिलती है।`
                      : `${batch.participants} businesses have committed ${batch.committedQty} ${product.unit}. Your ${qty} ${product.unit} completes the ${batch.thresholdQty.toLocaleString("en-IN")} ${product.unit} batch. Each business receives its own quantity.`
                    : lang === "hi"
                      ? `${batch.participants} व्यवसायों ने ${batch.committedQty} ${product.unit} तय किया है। आपके ${qty} ${product.unit} के बाद भी ${remaining - qty} ${product.unit} बाकी रहेंगे। सीमा पूरी न होने पर रकम लौटा दी जाती है।`
                      : `${batch.participants} businesses have committed ${batch.committedQty} ${product.unit}. After your ${qty} ${product.unit}, ${remaining - qty} ${product.unit} would still be needed. If the threshold isn't reached, you're refunded.`}
                </p>
              </div>
            ) : null}
            <p className="num mt-2 text-[11px] text-muted-foreground">
              {batchOpen
                ? `${lang === "hi" ? "बंद होगा" : "Closes"} ${formatDate(batch.expiresAt, lang)}`
                : t(`stage_${batch.status === "confirmed" ? "confirmed" : "expired_refunded"}`)}
            </p>
            <details className="mt-1">
              <summary className="cursor-pointer text-[11px] font-semibold text-primary">
                {lang === "hi" ? "बैच कैसे काम करता है" : "How batches work"}
              </summary>
              <p className="mt-1 text-[11px] text-muted-foreground">{t("batchExplain")}</p>
              <Note>{t("thresholdHelp")}</Note>
            </details>
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

      {options.length ? (
        <>
          <SectionTitle>{t("compareOptions")}</SectionTitle>
          <div className="space-y-2 px-4">
            <p className="text-[11px] text-muted-foreground">
              {lang === "hi"
                ? `समान स्पेसिफ़िकेशन, ${qty} ${product.unit}, टैक्स से पहले डिलीवर्ड लागत।`
                : `Same specification, ${qty} ${product.unit}, delivered cost before tax.`}
            </p>
            {(() => {
              const rows = options.map((o) => {
                const isLocal = o.id === "alt-delhi";
                const unit = isLocal ? localPaise : o.unit;
                return { ...o, isLocal, unit, delivered: unit * qty + o.delivery };
              });
              const platform = rows.filter((r) => !r.isLocal);
              const minAll = Math.min(...rows.map((r) => r.delivered));
              const minLead = Math.min(...rows.map((r) => r.lead));
              void platform;
              return rows.map((o) => (
                <div
                  key={o.id}
                  className={
                    o.isLocal
                      ? "rounded-xl border border-dashed border-border bg-secondary p-3"
                      : "rounded-xl border border-border bg-card p-3 shadow-app"
                  }
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-foreground">
                        {o.isLocal ? (lang === "hi" ? "आपका लोकल रेट (संदर्भ)" : "Your local quote (reference)") : o.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {o.city} · {o.lead} {lang === "hi" ? "दिन" : "days"} · {perUnit(o.unit, product.unit)} +{" "}
                        {rupees(o.delivery)}
                      </p>
                    </div>
                    <p className="num shrink-0 text-right text-sm font-bold text-foreground">{rupees(o.delivered)}</p>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {o.delivered === minAll ? (
                      <Pill tone="positive">{lang === "hi" ? "सबसे कम डिलीवर्ड लागत" : "Lowest delivered cost"}</Pill>
                    ) : null}
                    {o.lead === minLead ? (
                      <Pill tone="neutral">{lang === "hi" ? "सबसे तेज़ डिलीवरी" : "Fastest delivery"}</Pill>
                    ) : null}
                    {o.isLocal ? (
                      <Pill tone="warning">{lang === "hi" ? "सत्यापित ऑफ़र नहीं" : "Not a platform offer"}</Pill>
                    ) : null}
                  </div>
                  {o.isLocal ? (
                    <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                      <label htmlFor="local-quote" className="text-[11px] text-muted-foreground">
                        {lang === "hi" ? `आपका रेट (₹/${product.unit}, डिलीवरी सहित)` : `Your rate (₹/${product.unit}, delivered)`}
                      </label>
                      <input
                        id="local-quote"
                        inputMode="numeric"
                        value={localQuote}
                        onChange={(e) => setLocalQuote(e.target.value.replace(/\D/g, "").slice(0, 5))}
                        className="tap w-20 rounded-lg border border-input bg-card px-2 text-right text-sm"
                      />
                    </div>
                  ) : (
                    <p className="mt-1 text-[11px] text-muted-foreground">{lang === "hi" ? o.noteHi : o.noteEn}</p>
                  )}
                </div>
              ));
            })()}
          </div>
        </>
      ) : null}

      <div className="px-4 pt-3">
        <details className="rounded-xl border border-border bg-card p-3">
          <summary className="cursor-pointer text-sm font-bold text-foreground">{t("specifications")}</summary>
          <div className="mt-2">
            {product.specs.map((sp) => (
              <Row key={sp.key} label={lang === "hi" ? sp.labelHi : sp.labelEn} value={sp.value} />
            ))}
            {product.match.gsm ? <Note>{t("gsmHelp")}</Note> : null}
          </div>
        </details>
      </div>

      <div className="h-6" />

      <Sheet open={badgeOpen} onClose={() => setBadgeOpen(false)} title={t("verifiedDemo")}>
        <p className="text-xs text-muted-foreground">{t("verifiedDemoBody")}</p>
      </Sheet>
    </Screen>
  );
}
