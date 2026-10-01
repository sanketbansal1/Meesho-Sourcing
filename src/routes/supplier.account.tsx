import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Info, Wand2 } from "lucide-react";
import { Screen } from "@/components/app/Shell";
import { Button, Card, Note, Row, SectionTitle } from "@/components/app/ui";
import { SUPPLIERS } from "@/lib/demo/catalog";
import { actions } from "@/lib/demo/store";
import { useApp } from "@/lib/useApp";

export const Route = createFileRoute("/supplier/account")({
  head: () => ({
    meta: [
      { title: "Supplier account — Meesho Sourcing concept" },
      {
        name: "description",
        content: "Material supplier profile, role switch back to the seller app and language settings.",
      },
      { property: "og:title", content: "Supplier account — Meesho Sourcing concept" },
      { property: "og:description", content: "Switch roles and language from the supplier side." },
    ],
  }),
  component: SupplierAccount,
});

function SupplierAccount() {
  const { s, t, lang } = useApp();
  const navigate = useNavigate();
  const me = SUPPLIERS["sup-surat"]!;

  return (
    <Screen title={t("nav_account")}>
      <div className="space-y-3 px-4 pt-3">
        <Card>
          <p className="text-sm font-bold text-foreground">{me.name}</p>
          <Row label={lang === "hi" ? "शहर" : "City"} value={`${me.city}, ${me.state}`} />
          <Row label={lang === "hi" ? "भूमिका" : "Role"} value={t("roleSupplier")} />
          <Row label={lang === "hi" ? "खरीदार" : "Purchaser"} value="Meesho — concept" />
          <Note>
            {lang === "hi"
              ? "यह एक काल्पनिक सप्लायर है, किसी असली कंपनी से संबंध नहीं।"
              : "This is an explicitly fictional supplier, unrelated to any real company."}
          </Note>
        </Card>

        <SectionTitle>{t("role")}</SectionTitle>
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
          <Button variant={s.role === "supplier" ? "primary" : "outline"} onClick={() => actions.setRole("supplier")}>
            {t("roleSupplier")}
          </Button>
        </div>

        <SectionTitle>{t("language")}</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          <Button variant={lang === "en" ? "primary" : "outline"} onClick={() => actions.setLang("en")}>
            English
          </Button>
          <Button variant={lang === "hi" ? "primary" : "outline"} onClick={() => actions.setLang("hi")}>
            हिन्दी
          </Button>
        </div>

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
