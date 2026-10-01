import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Screen } from "@/components/app/Shell";
import { Button, Card, Empty, Note, Pill, Row, SectionTitle } from "@/components/app/ui";
import { rupees } from "@/lib/demo/money";
import { MARKETPLACE } from "@/lib/demo/seed";
import { actions, availableCredit } from "@/lib/demo/store";
import { formatDate, useApp } from "@/lib/useApp";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments — Meesho Sourcing concept" },
      {
        name: "description",
        content:
          "Sales settlements and sourcing credit side by side: available, reserved, outstanding, repaid and due amounts with a clear ledger.",
      },
      { property: "og:title", content: "Payments — Meesho Sourcing concept" },
      { property: "og:description", content: "Sales-linked repayment of simulated sourcing credit." },
    ],
  }),
  component: PaymentsScreen,
});

function PaymentsScreen() {
  const { s, t, lang } = useApp();
  const [tab, setTab] = useState<"settlements" | "credit">("credit");
  const c = s.credit;
  const available = availableCredit(s);
  const overdue = c.dueAt ? new Date(c.dueAt) < new Date(s.demoNow) && c.outstandingPaise > 0 : false;

  return (
    <Screen title={t("nav_payments")}>
      <div className="grid grid-cols-2 gap-2 px-4 pt-3" role="tablist" aria-label={t("nav_payments")}>
        <Button
          role="tab"
          aria-selected={tab === "settlements"}
          variant={tab === "settlements" ? "primary" : "outline"}
          onClick={() => setTab("settlements")}
        >
          {t("salesSettlements")}
        </Button>
        <Button
          role="tab"
          aria-selected={tab === "credit"}
          variant={tab === "credit" ? "primary" : "outline"}
          onClick={() => setTab("credit")}
        >
          {t("sourcingCredit")}
        </Button>
      </div>

      {tab === "credit" ? (
        <div className="space-y-3 px-4 pt-3">
          <Card>
            <Row label={t("creditLimit")} value={rupees(c.limitPaise)} />
            <Row label={t("available")} value={rupees(available)} strong tone="positive" />
            <Row label={t("reserved")} value={rupees(c.reservedPaise)} />
            <Row label={t("outstanding")} value={rupees(c.outstandingPaise)} strong />
            <Row label={t("repaid")} value={rupees(c.repaidPaise)} />
            <Row label={t("due")} value={c.dueAt ? formatDate(c.dueAt, lang) : "—"} />
            <div className="mt-2 flex flex-wrap gap-1">
              <Pill tone="positive">
                {t("available")}: {rupees(available)}
              </Pill>
              {c.reservedPaise > 0 ? (
                <Pill tone="warning">
                  {t("reserved")}: {rupees(c.reservedPaise)}
                </Pill>
              ) : null}
              {c.outstandingPaise > 0 ? (
                <Pill tone="brand">
                  {t("outstanding")}: {rupees(c.outstandingPaise)}
                </Pill>
              ) : null}
              {overdue ? <Pill tone="danger">{lang === "hi" ? "देय तिथि निकल गई" : "Past due date"}</Pill> : null}
            </div>
            <Note>
              {lang === "hi"
                ? "ये केवल डेमो शर्तें हैं — कोई वास्तविक ऋण प्रस्ताव नहीं। 30 दिन की अवधि, योग्य सेटलमेंट का 20%, इस परिदृश्य में ब्याज ₹0।"
                : "These are illustrative demo terms, not a lending offer. 30-day window, 20% of eligible settlements, ₹0 interest in this scenario."}
            </Note>
            {c.outstandingPaise > 0 ? (
              <Button className="mt-2" size="lg" variant="outline" onClick={() => actions.repayNow(c.outstandingPaise)}>
                {t("repayNow")} · {rupees(c.outstandingPaise)}
              </Button>
            ) : null}
            <Note>{t("eligibleHelp")}</Note>
          </Card>

          <SectionTitle>{t("ledger")}</SectionTitle>
          {s.ledger.length === 0 ? (
            <Empty>{t("noSettlements")}</Empty>
          ) : (
            <ul className="space-y-2">
              {s.ledger.map((e) => (
                <li key={e.id}>
                  <Card className="p-2.5">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                      <p className="min-w-0 text-xs text-foreground">{e.note}</p>
                      <p
                        className={`num shrink-0 text-xs font-bold ${
                          e.kind === "repayment" || e.kind === "credit_drawn"
                            ? "text-foreground"
                            : "text-positive"
                        }`}
                      >
                        {rupees(e.amountPaise)}
                      </p>
                    </div>
                    <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      {e.kind.replace("_", " ")} · {formatDate(e.at, lang)}
                    </p>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="space-y-3 px-4 pt-3">
          <Card>
            <p className="text-xs font-bold text-foreground">{t("upcomingSettlement")}</p>
            <Row
              label={lang === "hi" ? "योग्य शुद्ध सेटलमेंट" : "Eligible net settlement"}
              value={rupees(MARKETPLACE.upcomingSettlementPaise)}
            />
            <Row
              label={t("deductionPct")}
              value={rupees(
                Math.min(Math.round(MARKETPLACE.upcomingSettlementPaise * 0.2), s.credit.outstandingPaise),
              )}
            />
            <Row
              label={t("amountYouReceive")}
              value={rupees(
                MARKETPLACE.upcomingSettlementPaise -
                  Math.min(Math.round(MARKETPLACE.upcomingSettlementPaise * 0.2), s.credit.outstandingPaise),
              )}
              strong
              tone="positive"
            />
            <Note>{t("eligibleHelp")}</Note>
          </Card>
          <Button size="lg" variant="outline" onClick={() => actions.simulateSettlement()}>
            {t("simulateSettlement")}
          </Button>
          <SectionTitle>{t("ledger")}</SectionTitle>
          {s.ledger.filter((e) => e.kind === "settlement" || e.kind === "payout" || e.kind === "repayment").length ===
          0 ? (
            <Empty>{t("noSettlements")}</Empty>
          ) : (
            <ul className="space-y-2">
              {s.ledger
                .filter((e) => e.kind === "settlement" || e.kind === "payout" || e.kind === "repayment")
                .map((e) => (
                  <li key={e.id}>
                    <Card className="p-2.5">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                        <p className="min-w-0 text-xs text-foreground">{e.note}</p>
                        <p className="num shrink-0 text-xs font-bold text-foreground">{rupees(e.amountPaise)}</p>
                      </div>
                      <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                        {e.kind} · {formatDate(e.at, lang)}
                      </p>
                    </Card>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
      <div className="h-4" />
    </Screen>
  );
}
