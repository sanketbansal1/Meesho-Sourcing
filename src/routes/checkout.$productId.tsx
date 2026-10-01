import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Screen } from "@/components/app/Shell";
import { Button, Card, Note, Pill, Row, SectionTitle } from "@/components/app/ui";
import { SELLER, getProduct } from "@/lib/demo/catalog";
import { priceQuote, rupees } from "@/lib/demo/money";
import { actions, availableCredit } from "@/lib/demo/store";
import type { RouteQuote } from "@/lib/demo/types";
import { formatDate, useApp } from "@/lib/useApp";

export const Route = createFileRoute("/checkout/$productId")({
  validateSearch: (search: Record<string, unknown>) => ({
    route: search.route === "buynow" ? ("buynow" as const) : ("batch" as const),
    qty: Number(search.qty) > 0 ? Number(search.qty) : 100,
  }),
  head: () => ({
    meta: [
      { title: "Checkout — Meesho Sourcing concept" },
      {
        name: "description",
        content:
          "Simulated checkout for raw materials: delivered price breakdown, demo tax, pay now or approved sourcing credit.",
      },
      { property: "og:title", content: "Checkout — Meesho Sourcing concept" },
      { property: "og:description", content: "Pay now or use simulated sourcing credit in the concept prototype." },
    ],
  }),
  component: CheckoutScreen,
});

function CheckoutScreen() {
  const { productId } = Route.useParams();
  const { route, qty } = Route.useSearch();
  const { s, t, lang } = useApp();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<"paynow" | "credit">("paynow");
  const [ack, setAck] = useState(false);
  const [busy, setBusy] = useState(false);

  const product = getProduct(productId)!;
  const batch = s.batches.find((b) => b.id === product.batchId);
  const quote: RouteQuote | null =
    route === "batch" && batch
      ? {
          unitPricePaise: batch.unitPricePaise,
          deliveryPaise: batch.deliveryPaise,
          minQty: batch.qtyRange[0],
          maxQty: batch.qtyRange[1],
          leadDays: batch.leadDays,
        }
      : product.buyNow;
  const pricing = quote ? priceQuote(quote, qty) : null;
  const available = availableCredit(s);
  const sample = s.samples.find((x) => x.productId === product.id);
  const needsSample = Boolean(product.requiresSampleApproval) && sample?.status !== "approved";
  const creditShort = pricing ? pricing.totalPaise > available : false;

  function place() {
    if (busy || !pricing) return;
    setBusy(true);
    const res = actions.placeOrder({ productId, route, qty, payment });
    if (!res.ok) {
      setBusy(false);
      toast.error(
        res.reason === "insufficient_credit"
          ? t("insufficientCredit")
          : res.reason === "out_of_range"
            ? t("outOfRange")
            : res.reason === "sample_required"
              ? t("sampleNeeded")
              : lang === "hi"
                ? "यह ऑर्डर अभी नहीं हो सका।"
                : "This order could not be placed.",
      );
      return;
    }
    navigate({ to: "/orders/$orderId", params: { orderId: res.orderId }, search: { placed: true } });
  }

  if (!pricing) {
    return (
      <Screen title={t("checkout")} back>
        <div className="p-4">
          <Note tone="warning">{t("outOfRange")}</Note>
        </div>
      </Screen>
    );
  }

  return (
    <Screen
      title={t("checkout")}
      back
      nav={false}
      sticky={
        <Button
          size="lg"
          disabled={busy || needsSample || (payment === "credit" && (!ack || creditShort))}
          onClick={place}
        >
          {busy ? t("loading") : `${t("placeOrder")} · ${rupees(pricing.totalPaise)}`}
        </Button>
      }
    >
      <div className="space-y-3 px-4 pt-3">
        <Card>
          <p className="text-sm font-bold text-foreground">
            {lang === "hi" ? product.nameHi : product.nameEn}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {product.specs.map((sp) => sp.value).join(" · ")}
          </p>
          <div className="mt-2">
            <Row label={t("qty")} value={`${qty} ${product.unit}`} />
            <Row
              label={t("purchaseRoute")}
              value={route === "batch" ? t("buyTogether") : t("buyNow")}
            />
            <Row label={t("deliveryAddress")} value={SELLER.address} />
            <Row
              label={t("estimatedArrival")}
              value={formatDate(
                new Date(new Date(s.demoNow).getTime() + (quote?.leadDays ?? 7) * 86400000).toISOString(),
                lang,
              )}
            />
            {product.requiresSampleApproval ? (
              <Row
                label={t("sampleStatus")}
                value={sample?.status === "approved" ? t("sampleApproved") : t("sampleNeeded")}
              />
            ) : null}
          </div>
        </Card>

        <Card>
          <Row label={t("perUnitPrice")} value={rupees(pricing.materialPaise)} />
          <Row label={t("delivery")} value={rupees(pricing.deliveryPaise)} />
          <Row label={t("preTaxDelivered")} value={rupees(pricing.materialPaise + pricing.deliveryPaise)} />
          <Row label={t("demoTax")} value={rupees(pricing.taxPaise)} tone="muted" />
          <div className="mt-1 border-t border-border pt-1">
            <Row label={t("totalPayable")} value={rupees(pricing.totalPaise)} strong />
          </div>
          <Note>
            {lang === "hi"
              ? "5% डेमो टैक्स एक प्रोटोटाइप धारणा है, कोई कर निर्धारण नहीं।"
              : "The 5% demo tax is a prototype assumption, not a tax determination."}
          </Note>
        </Card>

        <SectionTitle>{t("paymentMethod")}</SectionTitle>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-3">
            <input
              type="radio"
              name="pay"
              className="mt-1"
              checked={payment === "paynow"}
              onChange={() => setPayment("paynow")}
            />
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-foreground">{t("payNowSim")}</span>
              <span className="block text-[11px] text-muted-foreground">
                {lang === "hi"
                  ? "कोई असली कार्ड या बैंक जानकारी नहीं माँगी जाती।"
                  : "No real card or bank details are ever requested."}
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-3">
            <input
              type="radio"
              name="pay"
              className="mt-1"
              checked={payment === "credit"}
              onChange={() => setPayment("credit")}
            />
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-foreground">{t("useCredit")}</span>
              <span className="num block text-[11px] text-muted-foreground">
                {t("available")}: {rupees(available)}
              </span>
            </span>
          </label>
        </div>

        {payment === "credit" ? (
          <Card>
            <p className="text-xs font-bold text-foreground">{t("creditTerms")}</p>
            <Row label={t("amountFinanced")} value={rupees(pricing.totalPaise)} />
            <Row label={t("availableLimit")} value={rupees(available)} />
            <Row label={t("repaymentPeriod")} value={lang === "hi" ? "30 दिन" : "30 days"} />
            <Row label={t("deductionPct")} value={lang === "hi" ? "योग्य सेटलमेंट का 20%" : "20% of eligible settlements"} />
            <Row label={t("charges")} value={`${rupees(0)} (${lang === "hi" ? "इस डेमो में" : "in this demo"})`} />
            <p className="mt-1 text-[11px] font-semibold text-foreground">{t("deadlineHandling")}</p>
            <p className="text-[11px] text-muted-foreground">{t("deadlineBody")}</p>
            {creditShort ? <Note tone="warning">{t("insufficientCredit")}</Note> : null}
            <label className="mt-2 flex items-start gap-2 text-[11px] text-foreground">
              <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-0.5" />
              <span>{t("ackCredit")}</span>
            </label>
          </Card>
        ) : null}

        {needsSample ? <Note tone="warning">{t("sampleNeeded")}</Note> : null}

        <div className="pb-4">
          <Pill tone="brand">{t("soldByMeesho")}</Pill>
        </div>
      </div>
    </Screen>
  );
}
