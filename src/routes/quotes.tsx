import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Screen } from "@/components/app/Shell";
import { Button, Card, Empty, Note, Pill, Row, SectionTitle } from "@/components/app/ui";
import { SUPPLIERS } from "@/lib/demo/catalog";
import { rupees } from "@/lib/demo/money";
import { actions } from "@/lib/demo/store";
import { formatDate, useApp } from "@/lib/useApp";

export const Route = createFileRoute("/quotes")({
  head: () => ({
    meta: [
      { title: "Quotes for your requirements — Meesho Sourcing concept" },
      {
        name: "description",
        content:
          "Compare delivered quotes from material suppliers: unit price, delivered total, minimum quantity, lead time and quote expiry.",
      },
      { property: "og:title", content: "Quotes for your requirements — Meesho Sourcing concept" },
      {
        property: "og:description",
        content: "Side-by-side comparison of supplier quotes on a delivered-cost basis.",
      },
    ],
  }),
  component: QuotesScreen,
});

function QuotesScreen() {
  const { s, t, lang } = useApp();
  const reqs = s.requirements.filter((r) => s.quotes.some((q) => q.requirementId === r.id));

  return (
    <Screen title={t("quotesReceived")} back subtitle={t("conceptDemo")}>
      <div className="space-y-3 px-4 pt-3">
        {reqs.length === 0 ? (
          <Empty>
            {lang === "hi"
              ? "अभी कोई कोटेशन नहीं। अपनी माँग भेजें — डेमो में सप्लायर भूमिका से जवाब दिया जा सकता है।"
              : "No quotes yet. Send a requirement, then answer it from the supplier role in this demo."}
          </Empty>
        ) : null}

        {reqs.map((r) => {
          const quotes = s.quotes.filter((q) => q.requirementId === r.id);
          const delivered = quotes.map((q) => q.unitPricePaise * r.qty + q.deliveryPaise);
          const best = Math.min(...delivered);
          return (
            <div key={r.id} className="space-y-2">
              <SectionTitle>
                {r.productHint} · {r.qty} {r.unit}
              </SectionTitle>
              {quotes.map((q, i) => {
                const total = delivered[i]!;
                const isBest = total === best;
                const expired = q.expiresAt < s.demoNow;
                const qtyOk = r.qty >= q.minQty && r.qty <= q.maxQty;
                return (
                  <Card key={q.id} className={isBest ? "border-primary" : undefined}>
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                      <p className="min-w-0 truncate text-sm font-bold text-foreground">
                        {SUPPLIERS[q.supplierId]?.name ?? q.supplierId}
                      </p>
                      {expired ? (
                        <Pill tone="neutral">{t("expired")}</Pill>
                      ) : isBest ? (
                        <Pill tone="positive">{t("lowestDelivered")}</Pill>
                      ) : (
                        <Pill tone="neutral">{q.status}</Pill>
                      )}
                    </div>
                    <Row label={t("unitPrice")} value={`₹${(q.unitPricePaise / 100).toFixed(2)}/${r.unit}`} />
                    <Row label={t("delivery")} value={rupees(q.deliveryPaise)} />
                    <Row label={t("deliveredTotal")} value={rupees(total)} strong tone={isBest ? "positive" : undefined} />
                    <Row label={t("minQty")} value={`${q.minQty} – ${q.maxQty} ${r.unit}`} />
                    <Row label={t("leadTime")} value={`${q.leadDays} ${lang === "hi" ? "दिन" : "days"}`} />
                    <Row label={t("dispatchLocation")} value={q.dispatchCity} />
                    <Row
                      label={t("sampleAvailable")}
                      value={q.sampleAvailable ? (lang === "hi" ? "हाँ" : "Yes") : lang === "hi" ? "नहीं" : "No"}
                    />
                    <Row label={t("quoteExpiry")} value={formatDate(q.expiresAt, lang)} />
                    {!qtyOk ? (
                      <Note tone="warning">
                        {lang === "hi"
                          ? "आपकी मात्रा इस कोटेशन की सीमा से बाहर है।"
                          : "Your quantity falls outside this quote's minimum/maximum."}
                      </Note>
                    ) : null}
                    <Button
                      className="mt-2"
                      variant={q.status === "reviewed" ? "outline" : "primary"}
                      disabled={expired || q.status === "reviewed"}
                      onClick={() => {
                        actions.markQuoteReviewed(q.id);
                        toast.success(
                          lang === "hi"
                            ? "कोटेशन स्वीकार के लिए चिह्नित — डेमो में यहीं रुकता है"
                            : "Quote marked accepted — the concept demo stops here",
                        );
                      }}
                    >
                      {q.status === "reviewed" ? t("reviewed") : t("acceptQuote")}
                    </Button>
                  </Card>
                );
              })}
            </div>
          );
        })}

        <Note>
          {lang === "hi"
            ? "तुलना डिलीवर्ड लागत पर है — दाम और डिलीवरी मिलाकर। सभी आँकड़े काल्पनिक डेमो डेटा हैं।"
            : "Comparison is on delivered cost — price plus delivery together. All figures are illustrative demo data."}
        </Note>
      </div>
      <div className="h-6" />
    </Screen>
  );
}
