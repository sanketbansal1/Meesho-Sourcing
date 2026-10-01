import { createFileRoute, Link } from "@tanstack/react-router";
import { Screen } from "@/components/app/Shell";
import { Card, Empty, Note, Pill, Row, SectionTitle } from "@/components/app/ui";
import { getProduct } from "@/lib/demo/catalog";
import { formatDate, useApp } from "@/lib/useApp";

export const Route = createFileRoute("/supplier/demand")({
  head: () => ({
    meta: [
      { title: "Demand — Meesho Sourcing supplier (concept)" },
      {
        name: "description",
        content:
          "Consolidated raw-material demand: combined quantity, participating businesses, destinations and required dates.",
      },
      { property: "og:title", content: "Demand — Meesho Sourcing supplier (concept)" },
      { property: "og:description", content: "One consolidated requirement instead of many tiny enquiries." },
    ],
  }),
  component: DemandScreen,
});

function DemandScreen() {
  const { s, t, lang } = useApp();
  const batches = s.batches.filter((b) => getProduct(b.productId)?.supplierId === "sup-surat");

  return (
    <Screen title={t("nav_demand")} subtitle={t("conceptDemo")}>
      <div className="space-y-3 px-4 pt-3">
        <SectionTitle>{t("relevantDemand")}</SectionTitle>
        {batches.map((b) => {
          const p = getProduct(b.productId)!;
          return (
            <Card key={b.id}>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                <p className="min-w-0 text-sm font-bold text-foreground">{p.nameEn}</p>
                <Pill tone={b.status === "confirmed" ? "positive" : "warning"}>{b.status}</Pill>
              </div>
              <p className="mt-1 text-[11px] font-semibold text-primary">
                {lang === "hi"
                  ? `एक संयुक्त माँग: ${b.committedQty} ${p.unit}, ${b.participants} व्यवसायों के लिए`
                  : `One consolidated requirement: ${b.committedQty.toLocaleString("en-IN")} ${p.unit} for ${b.participants} businesses`}
              </p>
              <div className="mt-1">
                {p.specs.map((sp) => (
                  <Row key={sp.key} label={sp.labelEn} value={sp.value} />
                ))}
                <Row label={t("destinations")} value="Delhi NCR (Delhi, Noida, Ghaziabad, Gurugram, Faridabad)" />
                <Row label={t("requiredDates")} value={formatDate(b.expiresAt, lang)} />
                <Row
                  label={t("sampleAvailable")}
                  value={p.requiresSampleApproval ? (lang === "hi" ? "ज़रूरी" : "Required by buyers") : "—"}
                />
              </div>
            </Card>
          );
        })}

        <SectionTitle>{lang === "hi" ? "सेलर की भेजी माँग" : "Requirements sent by sellers"}</SectionTitle>
        {s.requirements.length === 0 ? (
          <Empty>{t("none")}</Empty>
        ) : (
          s.requirements.map((r) => (
            <Link key={r.id} to="/supplier/requirement/$reqId" params={{ reqId: r.id }}>
              <Card>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                  <p className="min-w-0 truncate text-xs font-bold text-foreground">{r.productHint || r.categoryId}</p>
                  <Pill tone={r.status === "open" ? "warning" : "positive"}>{r.status}</Pill>
                </div>
                <Row label={t("combinedQty")} value={`${r.qty} ${r.unit}`} />
                <Row label={t("destinations")} value={r.destination} />
                <Row label={t("requiredDates")} value={formatDate(r.neededByAt, lang)} />
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
