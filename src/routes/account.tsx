import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Info, Wand2 } from "lucide-react";
import { Screen } from "@/components/app/Shell";
import { Button, Card, Note, Row, SectionTitle } from "@/components/app/ui";
import { SELLER } from "@/lib/demo/catalog";
import { actions } from "@/lib/demo/store";
import { useApp } from "@/lib/useApp";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Account — Meesho Sourcing concept" },
      {
        name: "description",
        content: "Seller account, role switch between seller and material supplier, and language settings.",
      },
      { property: "og:title", content: "Account — Meesho Sourcing concept" },
      { property: "og:description", content: "Switch roles and language in the concept prototype." },
    ],
  }),
  component: AccountScreen,
});

function AccountScreen() {
  const { s, t, lang } = useApp();
  const navigate = useNavigate();

  return (
    <Screen title={t("nav_account")}>
      <div className="space-y-3 px-4 pt-3">
        <Card>
          <p className="text-sm font-bold text-foreground">{SELLER.business}</p>
          <Row label={lang === "hi" ? "मालिक" : "Owner"} value={SELLER.owner} />
          <Row label={lang === "hi" ? "शहर" : "City"} value={SELLER.city} />
          <Row label={lang === "hi" ? "व्यवसाय" : "Business"} value={SELLER.type} />
          <Row label={lang === "hi" ? "पता" : "Address"} value={SELLER.address} />
        </Card>

        <SectionTitle>{t("role")}</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          <Button variant={s.role === "seller" ? "primary" : "outline"} onClick={() => actions.setRole("seller")}>
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
        <Note>
          {lang === "hi"
            ? "भूमिका बदलने पर सारा डेमो डेटा सुरक्षित रहता है।"
            : "Switching roles preserves all demo state."}
        </Note>

        <SectionTitle>{t("language")}</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          <Button variant={lang === "en" ? "primary" : "outline"} onClick={() => actions.setLang("en")}>
            English
          </Button>
          <Button variant={lang === "hi" ? "primary" : "outline"} onClick={() => actions.setLang("hi")}>
            हिन्दी
          </Button>
        </div>

        <SectionTitle>{t("conceptDemo")}</SectionTitle>
        <Link to="/demo">
          <Card className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" aria-hidden />
            <span className="min-w-0 truncate text-sm font-semibold text-foreground">{t("demoControls")}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
          </Card>
        </Link>
        <Link to="/about">
          <Card className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
            <Info className="h-4 w-4 text-primary" aria-hidden />
            <span className="min-w-0 truncate text-sm font-semibold text-foreground">{t("aboutConcept")}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
          </Card>
        </Link>
      </div>
      <div className="h-6" />
    </Screen>
  );
}
