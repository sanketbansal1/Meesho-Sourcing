import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Info, Layers, Package, Wallet } from "lucide-react";
import { useState } from "react";
import { IntroSheet } from "@/components/app/IntroSheet";
import { Screen } from "@/components/app/Shell";
import { Button, Card, MaterialTile, Note, Pill, SectionTitle } from "@/components/app/ui";
import { SELLER, getProduct } from "@/lib/demo/catalog";
import { rupees } from "@/lib/demo/money";
import { MARKETPLACE } from "@/lib/demo/seed";
import { actions } from "@/lib/demo/store";
import { formatDate, useApp } from "@/lib/useApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Meesho Sourcing — seller home (concept)" },
      {
        name: "description",
        content:
          "Seller home for the Meesho Sourcing concept: marketplace orders, upcoming settlement and raw-material sourcing in one app.",
      },
      { property: "og:title", content: "Meesho Sourcing — seller home (concept)" },
      {
        property: "og:description",
        content: "Explore pooled raw-material procurement for small Meesho sellers.",
      },
    ],
  }),
  component: HomeScreen,
});

function HomeScreen() {
  const { s, t, lang } = useApp();
  const hi = lang === "hi";
  const [intro, setIntro] = useState(false);
  const jersey = getProduct("fab-jersey-black");
  const jerseyBatch = s.batches.find((b) => b.id === "batch-jersey");
  const activeOrder = s.orders.find((o) => o.stage !== "received" && o.stage !== "expired_refunded");
  const unread = s.notifications.filter((n) => n.forRole !== "supplier").slice(0, 4);

  return (
    <Screen title={SELLER.business} subtitle={`${SELLER.owner} · ${SELLER.city}`} right={<Pill tone="brand">{t("conceptDemo")}</Pill>}>
      <div className="space-y-3 px-4 pt-3">
        <div>
          <p className="text-lg font-bold text-foreground">{t("greeting")}</p>
          <p className="text-xs text-muted-foreground">{SELLER.type}</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Card className="p-2.5">
            <Package className="h-4 w-4 text-primary" aria-hidden />
            <p className="num mt-1 text-base font-bold text-foreground">{MARKETPLACE.ordersToday}</p>
            <p className="text-[10px] leading-tight text-muted-foreground">{t("marketplaceToday")}</p>
          </Card>
          <Card className="p-2.5">
            <Layers className="h-4 w-4 text-primary" aria-hidden />
            <p className="num mt-1 text-base font-bold text-foreground">{MARKETPLACE.pendingDispatch}</p>
            <p className="text-[10px] leading-tight text-muted-foreground">{t("pendingDispatch")}</p>
          </Card>
          <Card className="p-2.5">
            <Wallet className="h-4 w-4 text-positive" aria-hidden />
            <p className="num mt-1 text-base font-bold text-foreground">
              {rupees(MARKETPLACE.upcomingSettlementPaise)}
            </p>
            <p className="text-[10px] leading-tight text-muted-foreground">{t("upcomingSettlement")}</p>
          </Card>
        </div>

        <section className="rounded-2xl border border-primary/20 bg-primary-soft p-4">
          <h2 className="text-lg font-bold leading-snug text-foreground">
            {hi ? "आपके अगले प्रोडक्शन के लिए मटीरियल" : "Materials for your next production run"}
          </h2>
          <p className="mt-1 text-sm text-foreground/80">
            {hi
              ? "अलग-अलग क्षेत्रों के सप्लायर देखिए, साथ मिलकर खरीदिए और मंज़ूर सोर्सिंग क्रेडिट इस्तेमाल कीजिए।"
              : "Explore suppliers across regions, buy together and use approved sourcing credit."}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              to="/sourcing"
              className="tap flex items-center justify-center gap-1 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground"
            >
              {hi ? "मटीरियल देखें" : "Explore materials"}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              to="/sourcing/requirement"
              className="tap flex items-center justify-center rounded-xl border border-primary/40 bg-card px-3 text-center text-sm font-semibold text-primary"
            >
              {hi ? "अपनी ज़रूरत बताएँ" : "Describe my requirement"}
            </Link>
          </div>

          {jersey && jerseyBatch && jerseyBatch.status === "open" ? (
            <Link
              to="/sourcing/product/$productId"
              params={{ productId: jersey.id }}
              search={{ route: "batch" }}
              className="mt-3 grid grid-cols-[64px_minmax(0,1fr)] items-center gap-3 rounded-xl bg-card p-2"
            >
              <MaterialTile swatch={jersey.image} label={jersey.nameEn} className="aspect-square w-16" />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">{hi ? jersey.nameHi : jersey.nameEn}</p>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary" aria-hidden>
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(jerseyBatch.committedQty / jerseyBatch.thresholdQty) * 100}%` }}
                  />
                </div>
                <p className="num mt-1 text-[11px] text-foreground">
                  {jerseyBatch.committedQty.toLocaleString("en-IN")}/{jerseyBatch.thresholdQty.toLocaleString("en-IN")} m ·{" "}
                  <span className="font-semibold text-primary">
                    {jerseyBatch.thresholdQty - jerseyBatch.committedQty} m {hi ? "बाकी" : "left to confirm"}
                  </span>
                </p>
              </div>
            </Link>
          ) : null}

          <ol className="mt-3 grid grid-cols-3 gap-1 text-center text-[11px] font-semibold text-foreground">
            {(hi
              ? ["मटीरियल खरीदें", "प्रोडक्ट बनाएँ", "बिक्री से किश्त"]
              : ["Source materials", "Make products", "Track repayment from sales"]
            ).map((label, i) => (
              <li key={label} className="relative rounded-lg bg-card px-1 py-2">
                <span className="num mb-0.5 block text-primary">{i + 1}</span>
                {label}
              </li>
            ))}
          </ol>
        </section>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => {
              actions.startTour();
            }}
          >
            {hi ? "पूरी यात्रा आज़माएँ" : "Try full journey"}
          </Button>
          <Link
            to="/sourcing"
            className="tap flex items-center justify-center rounded-xl border border-border bg-card text-sm font-semibold text-foreground"
          >
            {hi ? "खुद देखें" : "Explore freely"}
          </Link>
        </div>

        <button
          onClick={() => setIntro(true)}
          className="tap flex w-full items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-left"
        >
          <Info className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          <span className="min-w-0 flex-1 text-sm font-semibold text-foreground">{t("exploreConcept")}</span>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        </button>
      </div>

      {activeOrder ? (
        <>
          <SectionTitle>{t("yourSourcingOrder")}</SectionTitle>
          <div className="px-4">
            <Link to="/orders/$orderId" search={{ placed: false }} params={{ orderId: activeOrder.id }}>
              <Card>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                  <p className="min-w-0 truncate text-sm font-semibold text-foreground">
                    {activeOrder.productName}
                  </p>
                  <Pill tone="brand">{t(`stage_${activeOrder.stage}`)}</Pill>
                </div>
                <p className="num mt-1 text-xs text-muted-foreground">
                  {activeOrder.id} · {activeOrder.pricing.qty} {lang === "hi" ? "यूनिट" : "units"} ·{" "}
                  {rupees(activeOrder.pricing.totalPaise)}
                </p>
              </Card>
            </Link>
          </div>
        </>
      ) : null}

      <SectionTitle>{t("notifications")}</SectionTitle>
      <ul className="space-y-2 px-4">
        {unread.map((n) => (
          <li key={n.id}>
            <Card className="p-2.5">
              <p className="text-xs text-foreground">{lang === "hi" ? n.titleHi : n.titleEn}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">{formatDate(n.at, lang)}</p>
            </Card>
          </li>
        ))}
      </ul>

      <div className="px-4 py-4">
        <Note>
          {t("demoData")}. {lang === "hi"
            ? "यह एक स्वतंत्र कॉन्सेप्ट प्रोटोटाइप है, मीशो का असली उत्पाद नहीं।"
            : "This is an independent concept prototype, not an actual Meesho product."}
        </Note>
      </div>

      <div className="px-4 pb-2">
        <Button variant="ghost" size="sm" onClick={() => actions.setLang(s.lang === "en" ? "hi" : "en")}>
          {s.lang === "en" ? "हिन्दी में देखें" : "View in English"}
        </Button>
      </div>

      <IntroSheet open={intro} onClose={() => setIntro(false)} />
    </Screen>
  );
}
