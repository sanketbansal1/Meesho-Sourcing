import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Screen } from "@/components/app/Shell";
import { Card, Empty, Note, Pill, SectionTitle, Button } from "@/components/app/ui";
import { rupees } from "@/lib/demo/money";
import { formatDate, useApp } from "@/lib/useApp";

export const Route = createFileRoute("/orders/")({
  head: () => ({
    meta: [
      { title: "Orders — Meesho Sourcing concept" },
      {
        name: "description",
        content:
          "Customer orders for finished goods and sourcing orders for raw materials, kept clearly separate in the concept prototype.",
      },
      { property: "og:title", content: "Orders — Meesho Sourcing concept" },
      { property: "og:description", content: "Track customer orders and raw-material sourcing orders." },
    ],
  }),
  component: OrdersScreen,
});

const CUSTOMER_ORDERS = [
  { id: "MSH-77421", item: "Black round-neck t-shirt", qty: 2, amountPaise: 79800, status: "Packed" },
  { id: "MSH-77418", item: "Oversized tee — maroon", qty: 1, amountPaise: 44900, status: "Shipped" },
  { id: "MSH-77402", item: "Cotton co-ord set", qty: 1, amountPaise: 109900, status: "Delivered" },
];

function OrdersScreen() {
  const { s, t, lang } = useApp();
  const [tab, setTab] = useState<"customer" | "sourcing">("sourcing");

  return (
    <Screen title={t("nav_orders")}>
      <div className="grid grid-cols-2 gap-2 px-4 pt-3" role="tablist" aria-label={t("nav_orders")}>
        <Button
          role="tab"
          aria-selected={tab === "customer"}
          variant={tab === "customer" ? "primary" : "outline"}
          onClick={() => setTab("customer")}
        >
          {t("customerOrders")}
        </Button>
        <Button
          role="tab"
          aria-selected={tab === "sourcing"}
          variant={tab === "sourcing" ? "primary" : "outline"}
          onClick={() => setTab("sourcing")}
        >
          {t("sourcingOrders")}
        </Button>
      </div>

      {tab === "customer" ? (
        <>
          <SectionTitle>{t("customerOrdersNote")}</SectionTitle>
          <ul className="space-y-2 px-4">
            {CUSTOMER_ORDERS.map((o) => (
              <li key={o.id}>
                <Card>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                    <p className="min-w-0 truncate text-sm font-semibold text-foreground">{o.item}</p>
                    <Pill tone="neutral">{o.status}</Pill>
                  </div>
                  <p className="num mt-1 text-xs text-muted-foreground">
                    {o.id} · {o.qty} pc · {rupees(o.amountPaise)}
                  </p>
                </Card>
              </li>
            ))}
          </ul>
          <div className="px-4 pt-3">
            <Note>{t("demoData")}</Note>
          </div>
        </>
      ) : (
        <>
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
                      <Pill tone={o.stage === "expired_refunded" ? "warning" : "brand"}>
                        {t(`stage_${o.stage}`)}
                      </Pill>
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
        </>
      )}
      <div className="h-4" />
    </Screen>
  );
}
