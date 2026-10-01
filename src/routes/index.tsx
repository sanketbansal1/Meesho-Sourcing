import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Compass, Sparkles } from "lucide-react";
import { Screen } from "@/components/app/Shell";
import { MaterialTile, Pill } from "@/components/app/ui";
import { CATEGORIES, SELLER, getProduct } from "@/lib/demo/catalog";
import { perUnit, rupees } from "@/lib/demo/money";
import { MARKETPLACE } from "@/lib/demo/seed";
import { actions } from "@/lib/demo/store";
import { useApp } from "@/lib/useApp";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HomeScreen,
});

const SHORT_CAT: Record<string, [string, string]> = {
  fabrics: ["Fabrics", "कपड़ा"],
  trims: ["Trims", "ट्रिम्स"],
  packaging: ["Packaging", "पैकेजिंग"],
  jewellery: ["Jewellery parts", "ज्वेलरी पुर्जे"],
};

function relativeDay(nowIso: string, atIso: string, hi: boolean): string {
  const d = Math.round((new Date(nowIso).setUTCHours(0, 0, 0, 0) - new Date(atIso).setUTCHours(0, 0, 0, 0)) / 86400000);
  if (d <= 0) return hi ? "आज" : "Today";
  if (d === 1) return hi ? "कल" : "Yesterday";
  return hi ? `${d} दिन पहले` : `${d} days ago`;
}

function HomeScreen() {
  const { s, t, lang } = useApp();
  const hi = lang === "hi";
  const jersey = getProduct("fab-jersey-black")!;
  const batch = s.batches.find((b) => b.id === "batch-jersey");
  const left = batch ? Math.max(0, batch.thresholdQty - batch.committedQty) : 0;
  const pct = batch ? Math.min(100, Math.round((batch.committedQty / batch.thresholdQty) * 100)) : 0;
  const closesIn = batch
    ? Math.max(0, Math.ceil((new Date(batch.expiresAt).getTime() - new Date(s.demoNow).getTime()) / 86400000))
    : 0;
  // Seeded notifications repeat the featured batch — only show genuine new events.
  const updates = s.notifications
    .filter((n) => n.forRole !== "supplier" && !n.id.startsWith("ntf-seed"))
    .slice(0, 3);

  const metrics = [
    { value: String(MARKETPLACE.ordersToday), label: hi ? "आज के ऑर्डर" : "orders today" },
    { value: String(MARKETPLACE.pendingDispatch), label: hi ? "डिस्पैच बाकी" : "to dispatch" },
    { value: rupees(MARKETPLACE.upcomingSettlementPaise), label: hi ? "सेटलमेंट" : "settlement", to: "/payments" as const },
  ];

  return (
    <Screen
      title="Meesho Sourcing"
      subtitle={`${SELLER.business} · ${SELLER.city}`}
    >
      <div className="min-h-full space-y-5 bg-surface px-4 pb-4 pt-4">
        {/* B. Greeting + summary */}
        <section className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-foreground">{t("greeting")}</h2>
            <Pill tone="brand">{t("conceptDemo")}</Pill>
          </div>
          <div className="grid grid-cols-3 divide-x divide-border rounded-xl bg-card py-3">
            {metrics.map((m) => {
              const inner = (
                <>
                  <span className="num block text-base font-bold text-foreground">{m.value}</span>
                  <span className="block text-xs text-muted-foreground">{m.label}</span>
                </>
              );
              return m.to ? (
                <Link key={m.label} to={m.to} className="px-2 text-center">
                  {inner}
                </Link>
              ) : (
                <div key={m.label} className="px-2 text-center">
                  {inner}
                </div>
              );
            })}
          </div>
        </section>

        {/* C. Primary sourcing feature */}
        <section className="grid min-h-[176px] grid-cols-[minmax(0,1fr)_112px] items-center gap-3 rounded-2xl bg-primary-soft p-4">
          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-wider text-primary">MEESHO SOURCING</p>
            <h2 className="mt-1 text-lg font-bold leading-tight text-foreground">
              {hi ? "कच्चा माल। ज़्यादा संभावनाएँ।" : "Raw materials. More possibilities."}
            </h2>
            <p className="mt-1 text-sm text-foreground/75">
              {hi ? "अलग-अलग क्षेत्रों के सप्लायर खोजें और साथ मिलकर खरीदें।" : "Find suppliers across regions and buy together."}
            </p>
            <Link
              to="/sourcing"
              className="tap mt-3 inline-flex items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              {hi ? "मटीरियल देखें" : "Explore materials"}
            </Link>
          </div>
          <MaterialTile swatch="sw-fabric" label={jersey.nameEn} className="aspect-square w-full rounded-xl bg-card" />
        </section>

        {/* D. Category shortcuts */}
        <nav aria-label={t("category")} className="grid grid-cols-4 gap-2">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              to="/sourcing/category/$categoryId"
              params={{ categoryId: c.id }}
              className="flex flex-col items-center gap-1.5 text-center"
            >
              <MaterialTile swatch={c.swatch} label={c.nameEn} className="aspect-square w-full rounded-xl bg-card" />
              <span className="text-xs font-semibold leading-tight text-foreground">
                {SHORT_CAT[c.id]?.[hi ? 1 : 0] ?? c.nameEn}
              </span>
            </Link>
          ))}
        </nav>

        {/* E. Featured batch */}
        {batch ? (
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">{hi ? "साथ मिलकर खरीदें" : "Buy together"}</h2>
            <Link
              to="/sourcing/product/$productId"
              params={{ productId: jersey.id }}
              search={{ route: batch.status === "open" ? "batch" : "buynow" }}
              className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 rounded-xl bg-card p-3"
            >
              <MaterialTile swatch={jersey.image} label={jersey.nameEn} className="aspect-square w-full" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{hi ? jersey.nameHi : jersey.nameEn}</p>
                <p className="text-xs text-muted-foreground">180 GSM · {hi ? "60 इंच चौड़ाई" : "60-inch width"}</p>
                <p className="num mt-0.5 text-sm font-bold text-foreground">
                  {perUnit(batch.unitPricePaise, jersey.unit)}{" "}
                  <span className="text-xs font-normal text-muted-foreground">{hi ? "मटीरियल दाम" : "material price"}</span>
                </p>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary" aria-hidden>
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
                <p className="num mt-1 text-xs text-foreground">
                  {batch.committedQty.toLocaleString("en-IN")}/{batch.thresholdQty.toLocaleString("en-IN")} m ·{" "}
                  {batch.status === "open" ? (
                    <span className="font-semibold text-primary">
                      {left} m {hi ? "बाकी" : "left to confirm"}
                    </span>
                  ) : (
                    <span className="font-semibold text-positive">
                      {batch.status === "confirmed" ? (hi ? "बैच पक्का" : "Batch confirmed") : hi ? "बंद" : "Closed"}
                    </span>
                  )}
                </p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  {batch.status === "open" ? (
                    <span className="text-xs text-muted-foreground">
                      {hi ? `${closesIn} दिन में बंद` : `Closes in ${closesIn} days`}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="text-sm font-semibold text-primary">{hi ? "बैच देखें" : "View batch"} →</span>
                </div>
              </div>
            </Link>
          </section>
        ) : null}

        {/* F. AI entry */}
        <Link
          to="/sourcing/requirement"
          className="tap grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-card px-3 py-3"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft text-primary">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-xs text-muted-foreground">{hi ? "समझ नहीं आ रहा कहाँ से शुरू करें?" : "Not sure where to start?"}</span>
            <span className="block text-sm font-semibold text-foreground">{hi ? "बताइए आपको क्या चाहिए" : "Describe what you need"}</span>
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
        </Link>

        {/* Updates — only meaningful new events */}
        {updates.length ? (
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">{t("notifications")}</h2>
            <ul className="divide-y divide-border rounded-xl bg-card">
              {updates.map((n) => (
                <li key={n.id} className="px-3 py-2.5">
                  <p className="text-sm text-foreground">{hi ? n.titleHi : n.titleEn}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{relativeDay(s.demoNow, n.at, hi)}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* G. Secondary demo help */}
        <button
          onClick={() => actions.startTour()}
          className="tap flex w-full items-center justify-center gap-2 text-sm text-muted-foreground"
        >
          <Compass className="h-4 w-4" aria-hidden />
          <span>
            {hi ? "सोर्सिंग कैसे काम करती है · " : "See how sourcing works · "}
            <span className="font-semibold text-primary">{hi ? "वॉकथ्रू शुरू करें" : "Start walkthrough"}</span>
          </span>
        </button>
      </div>
    </Screen>
  );
}
