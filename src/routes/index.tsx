import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Info, Layers, Package, Wallet } from "lucide-react";
import { useState } from "react";
import { IntroSheet } from "@/components/app/IntroSheet";
import { Screen } from "@/components/app/Shell";
import { Button, Card, Note, Pill, SectionTitle } from "@/components/app/ui";
import { SELLER } from "@/lib/demo/catalog";
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
  const [intro, setIntro] = useState(false);
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

        <Link
          to="/sourcing"
          className="block rounded-xl bg-primary p-4 text-primary-foreground shadow-app"
        >
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <p className="text-base font-bold">{t("sourceMaterials")}</p>
              <p className="text-xs opacity-90">{t("sourceMaterialsSub")}</p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
          </div>
        </Link>

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
            <Link to="/orders/$orderId" params={{ orderId: activeOrder.id }}>
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
