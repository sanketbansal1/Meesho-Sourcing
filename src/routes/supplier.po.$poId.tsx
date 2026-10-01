import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Screen } from "@/components/app/Shell";
import { Button, Card, Empty, Field, Input, Note, Pill, Row, SectionTitle } from "@/components/app/ui";
import { getProduct } from "@/lib/demo/catalog";
import { rupees } from "@/lib/demo/money";
import { actions } from "@/lib/demo/store";
import { useApp } from "@/lib/useApp";

export const Route = createFileRoute("/supplier/po/$poId")({
  head: () => ({
    meta: [
      { title: "Consolidated order — Meesho Sourcing supplier (concept)" },
      {
        name: "description",
        content:
          "Aggregated material quantity, seller allocation list, packing information and dispatch submission for a confirmed order.",
      },
      { property: "og:title", content: "Consolidated order — Meesho Sourcing supplier (concept)" },
      { property: "og:description", content: "One order covering many small businesses' raw-material shares." },
    ],
  }),
  component: PODetail,
});

function PODetail() {
  const { poId } = Route.useParams();
  const { s, t, lang } = useApp();
  const po = s.pos.find((p) => p.id === poId);
  const [ref, setRef] = useState("");

  if (!po) {
    return (
      <Screen title={t("nav_orders")} back>
        <div className="p-4">
          <Empty>{t("none")}</Empty>
        </div>
      </Screen>
    );
  }
  const product = getProduct(po.productId)!;

  return (
    <Screen title={po.id} back subtitle={product.nameEn}>
      <div className="space-y-3 px-4 pt-3">
        <Card>
          <Row label={t("purchaser")} value="Meesho — concept" />
          <Row label={t("combinedQty")} value={`${po.totalQty.toLocaleString("en-IN")} ${product.unit}`} />
          <Row label={t("unitPrice")} value={`₹${(po.unitPricePaise / 100).toFixed(2)}/${product.unit}`} />
          <Row
            label={lang === "hi" ? "मटीरियल मूल्य (टैक्स से पहले)" : "Material value (before demo tax)"}
            value={rupees(po.totalQty * po.unitPricePaise)}
            strong
          />
          <Row label={t("participatingBusinesses")} value={String(po.participants)} />
          <Row label={t("paymentStatus")} value={po.paymentStatus.replace("_", " ")} />
          {po.dispatchRef ? <Row label="Dispatch reference" value={po.dispatchRef} /> : null}
        </Card>

        <div className="grid gap-2">
          <Button variant={po.acknowledged ? "outline" : "primary"} disabled={po.acknowledged} onClick={() => actions.acknowledgePO(po.id)}>
            {po.acknowledged ? `${t("acknowledgeOrder")} ✓` : t("acknowledgeOrder")}
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={po.preparation === "in_progress" ? "primary" : "outline"}
              onClick={() => actions.setPOPreparation(po.id, "in_progress")}
            >
              {t("preparation")}: {lang === "hi" ? "चालू" : "in progress"}
            </Button>
            <Button
              variant={po.preparation === "ready" ? "primary" : "outline"}
              onClick={() => actions.setPOPreparation(po.id, "ready")}
            >
              {t("preparation")}: {lang === "hi" ? "तैयार" : "ready"}
            </Button>
          </div>
        </div>

        <Card>
          <Field label={t("submitDispatch")} id="po-ref" hint="e.g. MSD-77421">
            <Input id="po-ref" value={ref} onChange={(e) => setRef(e.target.value)} />
          </Field>
          <Button
            className="mt-2"
            size="lg"
            disabled={!ref.trim()}
            onClick={() => {
              actions.setPODispatch(po.id, ref.trim());
              toast.success(lang === "hi" ? "डिस्पैच दर्ज हुआ" : "Dispatch recorded");
            }}
          >
            {t("submitDispatch")}
          </Button>
          <Note>
            {lang === "hi"
              ? "सेलर के ऑर्डर तभी 'भेजा गया' होंगे जब वे क्वालिटी जाँच पार कर चुके हों।"
              : "Seller orders move to dispatched only once they have passed the quality check stage."}
          </Note>
        </Card>

        <SectionTitle>{t("allocations")}</SectionTitle>
        <Card>
          <ul className="divide-y divide-border">
            {po.allocations.map((a) => (
              <li key={a.business} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 py-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-foreground">{a.business}</p>
                  <p className="text-[11px] text-muted-foreground">{a.city}</p>
                </div>
                <Pill tone="neutral">
                  {a.qty} {product.unit}
                </Pill>
              </li>
            ))}
          </ul>
          <Note>
            {lang === "hi"
              ? "निजी संपर्क जानकारी साझा नहीं की जाती। हर व्यवसाय को अपना हिस्सा मिलता है।"
              : "No personal contact details are shared. Each business receives its own quantity."}
          </Note>
        </Card>
      </div>
      <div className="h-6" />
    </Screen>
  );
}
