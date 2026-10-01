import { createFileRoute, Link } from "@tanstack/react-router";
import { Screen } from "@/components/app/Shell";
import { Card, Empty, Note, Pill, Row } from "@/components/app/ui";
import { getProduct } from "@/lib/demo/catalog";
import { rupees } from "@/lib/demo/money";
import { formatDate, useApp } from "@/lib/useApp";

export const Route = createFileRoute("/supplier/orders")({
  head: () => ({
    meta: [
      { title: "Purchase orders — Meesho Sourcing supplier (concept)" },
      {
        name: "description",
        content: "Confirmed consolidated purchase orders from Meesho with aggregated quantity and seller allocations.",
      },
      { property: "og:title", content: "Purchase orders — Meesho Sourcing supplier (concept)" },
      { property: "og:description", content: "Meesho is the purchaser on each confirmed consolidated order." },
    ],
  }),
  component: SupplierOrders,
});

function SupplierOrders() {
  const { s, t, lang } = useApp();
  return (
    <Screen title={t("nav_orders")} subtitle={t("confirmedPOs")}>
      <div className="space-y-3 px-4 pt-3">
        {s.pos.length === 0 ? (
          <Empty>
            {lang === "hi"
              ? "अभी कोई पक्का ऑर्डर नहीं। जब बैच अपनी सीमा पूरी करेगा, यहाँ दिखेगा।"
              : "No confirmed order yet. One appears here as soon as a batch reaches its threshold."}
          </Empty>
        ) : (
          s.pos.map((po) => (
            <Link key={po.id} to="/supplier/po/$poId" params={{ poId: po.id }}>
              <Card>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                  <p className="min-w-0 truncate text-sm font-bold text-foreground">{po.id}</p>
                  <Pill tone={po.acknowledged ? "positive" : "warning"}>
                    {po.acknowledged ? "acknowledged" : "new"}
                  </Pill>
                </div>
                <p className="text-[11px] text-muted-foreground">{getProduct(po.productId)?.nameEn}</p>
                <Row label={t("purchaser")} value="Meesho — concept" />
                <Row label={t("combinedQty")} value={po.totalQty.toLocaleString("en-IN")} />
                <Row
                  label={lang === "hi" ? "मटीरियल मूल्य (टैक्स से पहले)" : "Material value (before demo tax)"}
                  value={rupees(po.totalQty * po.unitPricePaise)}
                  strong
                />
                <Row label={lang === "hi" ? "बना" : "Created"} value={formatDate(po.createdAt, lang)} />
              </Card>
            </Link>
          ))
        )}
        <Note>{t("demoData")}</Note>
      </div>
      <div className="h-4" />
    </Screen>
  );
}
