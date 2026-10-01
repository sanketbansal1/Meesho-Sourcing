import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Screen } from "@/components/app/Shell";
import { Button, Card, Empty, Field, Input, Note, Row, SectionTitle, Select } from "@/components/app/ui";
import { addDays } from "@/lib/demo/seed";
import { actions } from "@/lib/demo/store";
import { formatDate, useApp } from "@/lib/useApp";

export const Route = createFileRoute("/supplier/requirement/$reqId")({
  head: () => ({
    meta: [
      { title: "Requirement and quote — Meesho Sourcing supplier (concept)" },
      {
        name: "description",
        content: "Review a seller requirement's specifications and submit a quote with price, capacity and lead time.",
      },
      { property: "og:title", content: "Requirement and quote — Meesho Sourcing supplier (concept)" },
      { property: "og:description", content: "Supplier quoting flow in the concept prototype." },
    ],
  }),
  component: RequirementDetail,
});

function RequirementDetail() {
  const { reqId } = Route.useParams();
  const { s, t, lang } = useApp();
  const req = s.requirements.find((r) => r.id === reqId);
  const [form, setForm] = useState({
    confirmSpec: "yes",
    minQty: "",
    price: "",
    capacity: "",
    lead: "",
    expiryDays: "7",
    dispatchCity: "Surat",
    sample: "yes",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const quotes = s.quotes.filter((q) => q.requirementId === reqId);

  if (!req) {
    return (
      <Screen title={t("nav_demand")} back>
        <div className="p-4">
          <Empty>{t("none")}</Empty>
        </div>
      </Screen>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!form.price || Number(form.price) <= 0) err.price = lang === "hi" ? "दाम भरें" : "Enter a unit price";
    if (!form.minQty || Number(form.minQty) <= 0) err.minQty = lang === "hi" ? "मात्रा भरें" : "Enter a minimum quantity";
    if (!form.capacity || Number(form.capacity) < Number(form.minQty))
      err.capacity = lang === "hi" ? "क्षमता न्यूनतम से कम नहीं" : "Capacity must be at least the minimum";
    if (!form.lead || Number(form.lead) <= 0) err.lead = lang === "hi" ? "लीड टाइम भरें" : "Enter a lead time";
    setErrors(err);
    if (Object.keys(err).length) return;
    actions.submitSupplierQuote({
      requirementId: req!.id,
      supplierId: "sup-surat",
      unitPricePaise: Math.round(Number(form.price) * 100),
      deliveryPaise: 40000,
      minQty: Number(form.minQty),
      maxQty: Number(form.capacity),
      leadDays: Number(form.lead),
      expiresAt: addDays(s.demoNow, Number(form.expiryDays || 7)),
      dispatchCity: form.dispatchCity,
      sampleAvailable: form.sample === "yes",
    });
    toast.success(lang === "hi" ? "कोटेशन भेजा गया" : "Quote sent to the seller");
  }

  return (
    <Screen title={req.id} back subtitle={req.productHint}>
      <div className="space-y-3 px-4 pt-3">
        <Card>
          <Row label={t("combinedQty")} value={`${req.qty} ${req.unit}`} />
          <Row label={t("destinations")} value={req.destination} />
          <Row label={t("requiredDates")} value={formatDate(req.neededByAt, lang)} />
          {Object.entries(req.specs).map(([k, v]) => (
            <Row key={k} label={k} value={v} />
          ))}
        </Card>

        <SectionTitle>{t("sendQuote")}</SectionTitle>
        <form className="space-y-3" onSubmit={submit}>
          <Field label={lang === "hi" ? "स्पेसिफिकेशन पुष्टि" : "Specification confirmation"} id="q-spec">
            <Select id="q-spec" value={form.confirmSpec} onChange={(e) => setForm({ ...form, confirmSpec: e.target.value })}>
              <option value="yes">{lang === "hi" ? "मैं यही स्पेसिफिकेशन दे सकता हूँ" : "I can supply this exact specification"}</option>
              <option value="partial">{lang === "hi" ? "थोड़ा अलग — विवरण नीचे" : "Close variant — noted below"}</option>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label={t("minQty")} id="q-min" error={errors.minQty}>
              <Input id="q-min" inputMode="numeric" value={form.minQty} onChange={(e) => setForm({ ...form, minQty: e.target.value.replace(/\D/g, "") })} />
            </Field>
            <Field label={`${t("unitPrice")} (₹)`} id="q-price" error={errors.price}>
              <Input id="q-price" inputMode="decimal" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value.replace(/[^\d.]/g, "") })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label={t("capacity")} id="q-cap" error={errors.capacity}>
              <Input id="q-cap" inputMode="numeric" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value.replace(/\D/g, "") })} />
            </Field>
            <Field label={t("leadTime")} id="q-lead" error={errors.lead}>
              <Input id="q-lead" inputMode="numeric" value={form.lead} onChange={(e) => setForm({ ...form, lead: e.target.value.replace(/\D/g, "") })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label={`${t("quoteExpiry")} (${lang === "hi" ? "दिन" : "days"})`} id="q-exp">
              <Input id="q-exp" inputMode="numeric" value={form.expiryDays} onChange={(e) => setForm({ ...form, expiryDays: e.target.value.replace(/\D/g, "") })} />
            </Field>
            <Field label={t("dispatchLocation")} id="q-city">
              <Input id="q-city" value={form.dispatchCity} onChange={(e) => setForm({ ...form, dispatchCity: e.target.value })} />
            </Field>
          </div>
          <Field label={t("sampleAvailable")} id="q-smp">
            <Select id="q-smp" value={form.sample} onChange={(e) => setForm({ ...form, sample: e.target.value })}>
              <option value="yes">{lang === "hi" ? "हाँ" : "Yes"}</option>
              <option value="no">{lang === "hi" ? "नहीं" : "No"}</option>
            </Select>
          </Field>
          <Button type="submit" size="lg">
            {t("sendQuote")}
          </Button>
          <Note>
            {lang === "hi"
              ? "पहले से स्वीकृत ऑर्डर का दाम इससे नहीं बदलता।"
              : "Submitting a quote never changes the price of an already accepted order."}
          </Note>
        </form>

        {quotes.length ? (
          <>
            <SectionTitle>{lang === "hi" ? "भेजे गए कोटेशन" : "Quotes you sent"}</SectionTitle>
            {quotes.map((q) => (
              <Card key={q.id}>
                <Row label={t("unitPrice")} value={`₹${(q.unitPricePaise / 100).toFixed(2)}`} />
                <Row label={t("leadTime")} value={String(q.leadDays)} />
                <Row label={t("quoteExpiry")} value={formatDate(q.expiresAt, lang)} />
                <Row label={lang === "hi" ? "स्थिति" : "Status"} value={q.status} />
              </Card>
            ))}
          </>
        ) : null}
      </div>
      <div className="h-6" />
    </Screen>
  );
}
