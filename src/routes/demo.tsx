import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Screen } from "@/components/app/Shell";
import { Button, Card, Note, Pill, Row, SectionTitle, Sheet } from "@/components/app/ui";
import { getProduct } from "@/lib/demo/catalog";
import { rupees } from "@/lib/demo/money";
import { actions } from "@/lib/demo/store";
import { formatDate, useApp } from "@/lib/useApp";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Demo controls — Meesho Sourcing concept" },
      {
        name: "description",
        content:
          "Evaluator tools: guided journey, role switch, fulfilment steps, sample delivery, batch expiry, settlement simulation, demo clock and reset.",
      },
      { property: "og:title", content: "Demo controls — Meesho Sourcing concept" },
      { property: "og:description", content: "Explore every state of the Meesho Sourcing concept prototype." },
    ],
  }),
  component: DemoScreen,
});

function DemoScreen() {
  const { s, t, lang } = useApp();
  const navigate = useNavigate();
  const [confirmReset, setConfirmReset] = useState(false);

  const advanceable = s.orders.filter(
    (o) => !["delivered", "received", "expired_refunded"].includes(o.stage),
  );
  const openBatches = s.batches.filter((b) => b.status === "open");
  const pendingSamples = s.samples.filter((x) => x.status === "requested");

  return (
    <Screen title={t("demoControls")} back subtitle={t("conceptDemo")}>
      <div className="space-y-3 px-4 pt-3">
        <Note tone="brand">
          {lang === "hi"
            ? "ये उपकरण सिर्फ़ मूल्यांकन के लिए हैं — आम सेलर प्रवाह से अलग।"
            : "These tools are for evaluators only and sit outside the ordinary seller workflow."}
        </Note>

        <Card>
          <Row label={t("demoDate")} value={formatDate(s.demoNow, lang)} />
          <div className="mt-2 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => actions.advanceDate(1)}>
              +1 {lang === "hi" ? "दिन" : "day"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => actions.advanceDate(3)}>
              +3 {lang === "hi" ? "दिन" : "दिन"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => actions.advanceDate(30)}>
              +30 {lang === "hi" ? "दिन" : "days"}
            </Button>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {lang === "hi"
              ? "तारीख़ बढ़ाने से बैच की समय-सीमा और क्रेडिट की देय तिथि दोनों प्रभावित होती हैं।"
              : "Advancing the date affects batch expiry and credit due dates together."}
          </p>
        </Card>

        <div className="grid gap-2">
          <Button
            size="lg"
            onClick={() => {
              actions.startTour();
              navigate({ to: "/" });
            }}
          >
            {t("startGuided")}
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={s.role === "seller" ? "primary" : "outline"}
              onClick={() => {
                actions.setRole("seller");
                navigate({ to: "/" });
              }}
            >
              {t("roleSeller")}
            </Button>
            <Button
              variant={s.role === "supplier" ? "primary" : "outline"}
              onClick={() => {
                actions.setRole("supplier");
                navigate({ to: "/supplier" });
              }}
            >
              {t("roleSupplier")}
            </Button>
          </div>
        </div>

        <SectionTitle>{t("advanceFulfilment")}</SectionTitle>
        {advanceable.length === 0 ? (
          <Note>{lang === "hi" ? "कोई सक्रिय सोर्सिंग ऑर्डर नहीं।" : "No active sourcing order yet."}</Note>
        ) : (
          advanceable.map((o) => (
            <Card key={o.id}>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-foreground">{o.productName}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {o.id} · {t(`stage_${o.stage}`)}
                  </p>
                </div>
                <Button size="sm" onClick={() => actions.advanceFulfilment(o.id)}>
                  {t("next")}
                </Button>
              </div>
            </Card>
          ))
        )}

        <SectionTitle>{t("receiveSample")}</SectionTitle>
        {pendingSamples.length === 0 ? (
          <Note>{lang === "hi" ? "कोई सैंपल इंतज़ार में नहीं।" : "No sample is awaiting delivery."}</Note>
        ) : (
          pendingSamples.map((smp) => (
            <Card key={smp.id}>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                <p className="min-w-0 truncate text-xs font-semibold text-foreground">
                  {getProduct(smp.productId)?.nameEn}
                </p>
                <Button size="sm" onClick={() => actions.receiveSample(smp.id)}>
                  {t("receiveSample")}
                </Button>
              </div>
            </Card>
          ))
        )}

        <SectionTitle>{t("expireBatch")}</SectionTitle>
        {openBatches.map((b) => (
          <Card key={b.id}>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">{getProduct(b.productId)?.nameEn}</p>
                <p className="num text-[11px] text-muted-foreground">
                  {b.committedQty}/{b.thresholdQty} · {formatDate(b.expiresAt, lang)}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => actions.expireBatch(b.id)}>
                {t("expireBatch")}
              </Button>
            </div>
          </Card>
        ))}

        <SectionTitle>{t("simulateSettlement")}</SectionTitle>
        <Card>
          <Row label={lang === "hi" ? "योग्य शुद्ध सेटलमेंट" : "Eligible net settlement"} value={rupees(800000)} />
          <Row
            label={t("deductionPct")}
            value={rupees(Math.min(160000, s.credit.outstandingPaise))}
          />
          <Row
            label={t("amountYouReceive")}
            value={rupees(800000 - Math.min(160000, s.credit.outstandingPaise))}
            strong
            tone="positive"
          />
          <Button
            className="mt-2"
            size="lg"
            onClick={() => {
              actions.simulateSettlement();
              toast.success(lang === "hi" ? "सेटलमेंट प्रोसेस हुआ" : "Settlement processed");
            }}
          >
            {t("simulateSettlement")}
          </Button>
        </Card>

        <SectionTitle>{t("resetDemo")}</SectionTitle>
        <Button variant="danger" size="lg" onClick={() => setConfirmReset(true)}>
          {t("resetDemo")}
        </Button>
        <div className="flex flex-wrap gap-1 pb-6">
          <Pill tone="neutral">{t("demoData")}</Pill>
        </div>
      </div>

      <Sheet open={confirmReset} onClose={() => setConfirmReset(false)} title={t("resetDemo")}>
        <p className="text-sm text-foreground">{t("resetConfirm")}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => setConfirmReset(false)}>
            {t("cancel")}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              actions.reset();
              setConfirmReset(false);
              toast.success(lang === "hi" ? "डेमो रीसेट हो गया" : "Demo reset");
              navigate({ to: "/" });
            }}
          >
            {t("confirm")}
          </Button>
        </div>
      </Sheet>
    </Screen>
  );
}
