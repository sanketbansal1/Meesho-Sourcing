import { createFileRoute } from "@tanstack/react-router";
import { Screen } from "@/components/app/Shell";
import { Card, Empty, Note, Pill, Row, SectionTitle } from "@/components/app/ui";
import { rupees } from "@/lib/demo/money";
import { addDays } from "@/lib/demo/seed";
import { formatDate, useApp } from "@/lib/useApp";

export const Route = createFileRoute("/supplier/payments")({
  head: () => ({
    meta: [
      { title: "Supplier payments — Meesho Sourcing concept" },
      {
        name: "description",
        content: "Purchase-order-linked payment milestones for the material supplier, as illustrative demo data.",
      },
      { property: "og:title", content: "Supplier payments — Meesho Sourcing concept" },
      { property: "og:description", content: "Supplier payment milestones in the concept prototype." },
    ],
  }),
  component: SupplierPayments,
});

function SupplierPayments() {
  const { s, t, lang } = useApp();
  return (
    <Screen title={t("nav_payments")} subtitle={t("conceptDemo")}>
      <div className="space-y-3 px-4 pt-3">
        {s.pos.length === 0 ? (
          <Empty>{t("none")}</Empty>
        ) : (
          s.pos.map((po) => {
            const value = po.totalQty * po.unitPricePaise;
            return (
              <Card key={po.id}>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                  <p className="min-w-0 truncate text-sm font-bold text-foreground">{po.id}</p>
                  <Pill tone={po.paymentStatus === "paid" ? "positive" : "warning"}>
                    {po.paymentStatus.replace("_", " ")}
                  </Pill>
                </div>
                <Row label={lang === "hi" ? "ऑर्डर मूल्य" : "Order value"} value={rupees(value)} strong />
                <SectionTitle>{lang === "hi" ? "भुगतान चरण" : "Payment milestones"}</SectionTitle>
                <Row
                  label={lang === "hi" ? "ऑर्डर स्वीकृति पर 30%" : "30% on acknowledgement"}
                  value={`${rupees(Math.round(value * 0.3))} · ${po.acknowledged ? (lang === "hi" ? "देय" : "due") : "—"}`}
                />
                <Row
                  label={lang === "hi" ? "डिस्पैच पर 50%" : "50% on dispatch"}
                  value={`${rupees(Math.round(value * 0.5))} · ${po.dispatchRef ? (lang === "hi" ? "देय" : "due") : "—"}`}
                />
                <Row
                  label={lang === "hi" ? "डिलीवरी के बाद 20%" : "20% after delivery"}
                  value={`${rupees(Math.round(value * 0.2))} · ${formatDate(addDays(po.createdAt, 21), lang)}`}
                />
              </Card>
            );
          })
        )}
        <Note>
          {lang === "hi"
            ? "सप्लायर का भुगतान किसी छोटे सेलर की क्रेडिट वापसी पर निर्भर नहीं है। कोई प्लेटफ़ॉर्म शुल्क या सब्सक्रिप्शन नहीं दिखाया गया।"
            : "Supplier payment does not depend on any small seller completing credit repayment. No platform fee or subscription is modelled."}
        </Note>
      </div>
      <div className="h-4" />
    </Screen>
  );
}
