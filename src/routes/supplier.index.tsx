import { createFileRoute, Link } from "@tanstack/react-router";
import { Screen } from "@/components/app/Shell";
import { Card, Empty, Note, Pill, Row, SectionTitle } from "@/components/app/ui";
import { SUPPLIERS, getProduct } from "@/lib/demo/catalog";
import { rupees } from "@/lib/demo/money";
import { formatDate, useApp } from "@/lib/useApp";

export const Route = createFileRoute("/supplier/")({
  head: () => ({
    meta: [
      { title: "Material supplier home — Meesho Sourcing concept" },
      {
        name: "description",
        content:
          "Surat Textile Works sees consolidated demand, quotes awaiting decision, confirmed purchase orders and dispatch tasks.",
      },
      { property: "og:title", content: "Material supplier home — Meesho Sourcing concept" },
      { property: "og:description", content: "The material supplier side of the pooled sourcing concept." },
    ],
  }),
  component: SupplierHome,
});

function SupplierHome() {
  const { s, t, lang } = useApp();
  const me = SUPPLIERS["sup-surat"]!;
  const openBatches = s.batches.filter((b) => getProduct(b.productId)?.supplierId === me.id);
  const pos = s.pos;
  const dispatchTasks = pos.filter((p) => !p.dispatchRef);
  const news = s.notifications.filter((n) => n.forRole !== "seller").slice(0, 3);

  return (
    <Screen title={me.name} subtitle={`${me.city}, ${me.state} · ${t("conceptDemo")}`}>
      <div className="space-y-3 px-4 pt-3">
        <Note tone="brand">
          {lang === "hi"
            ? "आप मटीरियल सप्लायर के रूप में देख रहे हैं। खरीदार मीशो है।"
            : "You are viewing as the material supplier. The purchaser is Meesho."}
        </Note>

        <SectionTitle>{t("relevantDemand")}</SectionTitle>
        {openBatches.map((b) => (
          <Card key={b.id}>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
              <p className="min-w-0 text-xs font-bold text-foreground">{getProduct(b.productId)?.nameEn}</p>
              <Pill tone={b.status === "open" ? "warning" : b.status === "confirmed" ? "positive" : "neutral"}>
                {b.status}
              </Pill>
            </div>
            <Row
              label={t("combinedQty")}
              value={`${b.committedQty.toLocaleString("en-IN")} / ${b.thresholdQty.toLocaleString("en-IN")}`}
            />
            <Row label={t("participatingBusinesses")} value={String(b.participants)} />
            <Row label={t("quoteExpiry")} value={formatDate(b.expiresAt, lang)} />
          </Card>
        ))}

        <SectionTitle>{t("quotesAwaiting")}</SectionTitle>
        {s.requirements.filter((r) => r.status === "open").length === 0 ? (
          <Empty>{t("none")}</Empty>
        ) : (
          <Link to="/supplier/demand">
            <Card>
              <p className="text-xs font-semibold text-foreground">
                {s.requirements.filter((r) => r.status === "open").length}{" "}
                {lang === "hi" ? "माँग आपके जवाब का इंतज़ार कर रही है" : "requirements awaiting your quote"}
              </p>
            </Card>
          </Link>
        )}

        <SectionTitle>{t("confirmedPOs")}</SectionTitle>
        {pos.length === 0 ? (
          <Empty>{t("none")}</Empty>
        ) : (
          pos.map((po) => (
            <Link key={po.id} to="/supplier/po/$poId" params={{ poId: po.id }}>
              <Card>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                  <p className="min-w-0 truncate text-xs font-bold text-foreground">{po.id}</p>
                  <Pill tone="positive">{po.acknowledged ? "acknowledged" : "new"}</Pill>
                </div>
                <Row
                  label={t("combinedQty")}
                  value={`${po.totalQty.toLocaleString("en-IN")} · ${po.participants} ${
                    lang === "hi" ? "व्यवसाय" : "businesses"
                  }`}
                />
                <Row
                  label={lang === "hi" ? "मटीरियल मूल्य" : "Material value"}
                  value={rupees(po.totalQty * po.unitPricePaise)}
                  strong
                />
              </Card>
            </Link>
          ))
        )}

        <SectionTitle>{t("dispatchTasks")}</SectionTitle>
        {dispatchTasks.length === 0 ? <Empty>{t("none")}</Empty> : null}
        {dispatchTasks.map((po) => (
          <Link key={po.id} to="/supplier/po/$poId" params={{ poId: po.id }}>
            <Card>
              <p className="text-xs font-semibold text-foreground">
                {po.id} · {t("preparation")}: {po.preparation.replace("_", " ")}
              </p>
            </Card>
          </Link>
        ))}

        <SectionTitle>{t("notifications")}</SectionTitle>
        {news.map((n) => (
          <Card key={n.id} className="p-2.5">
            <p className="text-xs text-foreground">{lang === "hi" ? n.titleHi : n.titleEn}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{formatDate(n.at, lang)}</p>
          </Card>
        ))}
      </div>
      <div className="h-4" />
    </Screen>
  );
}
