import { createFileRoute, Link } from "@tanstack/react-router";
import { Screen } from "@/components/app/Shell";
import { Card, Empty, Note, Pill, SectionTitle } from "@/components/app/ui";
import { rupees } from "@/lib/demo/money";
import { formatDate, useApp } from "@/lib/useApp";

export const Route = createFileRoute("/orders/")({
  head: () => ({
    meta: [
      { title: "Sourcing orders — Meesho Sourcing concept" },
      {
        name: "description",
        content:
          "Raw-material sourcing orders placed by a seller in the concept prototype, with batch, credit and delivery status.",
      },
      { property: "og:title", content: "Sourcing orders — Meesho Sourcing concept" },
      {
        property: "og:description",
        content: "Track raw-material sourcing orders, batch status and credit used.",
      },
    ],
  }),
  component: OrdersScreen,
});

function OrdersScreen() {
  const { s, t, lang } = useApp();

  return (
    <Screen title={t("nav_orders")}>
      <SectionTitle>{t("sourcingOrdersNote")}</SectionTitle>
      <div className="space-y-2 px-4">
        {s.orders.length === 0 ? (
          <Empty>{t("none")}</Empty>
        ) : (
          s.orders.map((o) => (
            <Link key={o.id} to="/orders/$orderId" search={{ placed: false }} params={{ orderId: o.id }}>
              <Card>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                  <p className="min-w-0 truncate text-sm font-semibold text-foreground">{o.productName}</p>
                  <Pill tone={o.stage === "expired_refunded" ? "warning" : "brand"}>{t(`stage_${o.stage}`)}</Pill>
                </div>
                <p className="num mt-1 text-xs text-muted-foreground">
                  {o.id} · {o.pricing.qty} · {rupees(o.pricing.totalPaise)} ·{" "}
                  {o.payment === "credit" ? t("sourcingCredit") : t("payNowSim")}
                </p>
                <p className="num text-[11px] text-muted-foreground">{formatDate(o.createdAt, lang)}</p>
              </Card>
            </Link>
          ))
        )}
      </div>
      <div className="px-4 pt-3">
        <Note>{t("demoData")}</Note>
      </div>
      <div className="h-4" />
    </Screen>
  );
}
