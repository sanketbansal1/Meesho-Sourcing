import { createFileRoute, Link } from "@tanstack/react-router";
import { Mic, Sparkles } from "lucide-react";
import { useState } from "react";
import { Screen } from "@/components/app/Shell";
import { Button, Card, Empty, Field, Input, Note, Pill, SectionTitle, Select, Textarea } from "@/components/app/ui";
import { CATEGORIES, SELLER } from "@/lib/demo/catalog";
import { findMatches, parseRequirement, SAMPLE_VOICE_TEXT, type ParsedRequirement } from "@/lib/demo/parse";
import { addDays } from "@/lib/demo/seed";
import { actions } from "@/lib/demo/store";
import type { CategoryId } from "@/lib/demo/types";
import { useApp } from "@/lib/useApp";

export const Route = createFileRoute("/sourcing/requirement")({
  head: () => ({
    meta: [
      { title: "Tell us what you need — Meesho Sourcing concept" },
      {
        name: "description",
        content:
          "Describe a raw-material requirement in your own words or fill a structured form; the simulated assistant turns it into an editable specification.",
      },
      { property: "og:title", content: "Tell us what you need — Meesho Sourcing concept" },
      {
        property: "og:description",
        content: "Simulated, deterministic requirement capture for pooled raw-material sourcing.",
      },
    ],
  }),
  component: RequirementScreen,
});

const FIELD_LABELS: Record<string, [string, string]> = {
  qty: ["Quantity", "मात्रा"],
  composition: ["Composition", "कंपोज़िशन"],
  gsm: ["GSM", "GSM"],
  width: ["Width (inch)", "चौड़ाई (इंच)"],
  finish: ["Finish", "फ़िनिश"],
  colour: ["Colour", "रंग"],
  destination: ["Delivery city", "डिलीवरी शहर"],
  neededBy: ["Needed within (days)", "कितने दिनों में चाहिए"],
};

function RequirementScreen() {
  const { s, t, lang } = useApp();
  const [mode, setMode] = useState<"describe" | "form">("describe");
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedRequirement | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [sentId, setSentId] = useState<string | null>(null);

  const [form, setForm] = useState({
    categoryId: "fabrics" as CategoryId,
    material: "",
    qty: "",
    unit: "m",
    colour: "",
    gsm: "",
    width: "",
    finish: "",
    days: "10",
  });

  function runParse(value: string) {
    const p = parseRequirement(value);
    setParsed(p);
    setConfirmed(false);
    setSentId(null);
    setDraft({
      qty: p.qty ? String(p.qty) : "",
      composition: p.composition ?? "",
      gsm: p.gsm ? String(p.gsm) : "",
      width: p.widthIn ? String(p.widthIn) : "",
      finish: "",
      colour: p.colour ?? "",
      destination: p.destination ?? SELLER.city,
      neededBy: p.withinDays ? String(p.withinDays) : "",
    });
  }

  const effective: ParsedRequirement | null = parsed
    ? {
        ...parsed,
        qty: draft.qty ? Number(draft.qty) : parsed.qty,
        gsm: draft.gsm ? Number(draft.gsm) : parsed.gsm,
        widthIn: draft.width ? Number(draft.width) : parsed.widthIn,
        colour: draft.colour || parsed.colour,
        destination: draft.destination || parsed.destination,
        withinDays: draft.neededBy ? Number(draft.neededBy) : parsed.withinDays,
        composition: draft.composition || parsed.composition,
        finish: draft.finish,
      }
    : null;

  const missing = effective
    ? (parsed?.questions ?? []).filter((q) => {
        const map: Record<string, string> = {
          qty: draft.qty,
          composition: draft.composition,
          gsm: draft.gsm,
          width: draft.width,
          finish: draft.finish,
          colour: draft.colour,
          destination: draft.destination,
          neededBy: draft.neededBy,
        };
        return !map[q];
      })
    : [];

  const matches = confirmed && effective ? findMatches(effective) : [];

  function submitToSuppliers() {
    if (!effective) return;
    const id = actions.submitRequirement({
      productHint: effective.material ?? form.material,
      categoryId: effective.categoryId ?? form.categoryId,
      qty: effective.qty ?? Number(form.qty || 0),
      unit: (effective.unit as "m") ?? "m",
      specs: {
        Composition: draft.composition || "—",
        GSM: draft.gsm ? `${draft.gsm} GSM` : "—",
        Width: draft.width ? `${draft.width} inch` : "—",
        Colour: draft.colour || "—",
        Finish: draft.finish || "—",
      },
      destination: draft.destination || SELLER.city,
      neededByAt: addDays(s.demoNow, Number(draft.neededBy || 10)),
      source: "assistant",
    });
    setSentId(id);
  }

  function submitForm(e: React.FormEvent) {
    e.preventDefault();
    const id = actions.submitRequirement({
      productHint: form.material,
      categoryId: form.categoryId,
      qty: Number(form.qty || 0),
      unit: form.unit as "m",
      specs: {
        Composition: form.material || "—",
        GSM: form.gsm ? `${form.gsm} GSM` : "—",
        Width: form.width ? `${form.width} inch` : "—",
        Colour: form.colour || "—",
        Finish: form.finish || "—",
      },
      destination: SELLER.city,
      neededByAt: addDays(s.demoNow, Number(form.days || 10)),
      source: "form",
    });
    setSentId(id);
  }

  return (
    <Screen title={t("tellUsWhatYouNeed")} back subtitle={t("demoData")}>
      <div className="space-y-3 px-4 pt-3">
        <div className="grid grid-cols-2 gap-2" role="tablist" aria-label={t("tellUsWhatYouNeed")}>
          <Button
            role="tab"
            aria-selected={mode === "describe"}
            variant={mode === "describe" ? "primary" : "outline"}
            onClick={() => setMode("describe")}
          >
            {t("describeIt")}
          </Button>
          <Button
            role="tab"
            aria-selected={mode === "form"}
            variant={mode === "form" ? "primary" : "outline"}
            onClick={() => setMode("form")}
          >
            {t("structuredForm")}
          </Button>
        </div>

        {mode === "describe" ? (
          <div className="space-y-2">
            <Field label={t("describeIt")} id="req-text" hint={t("voiceNote")}>
              <Textarea
                id="req-text"
                rows={4}
                value={text}
                onChange={(e) => setText((e.target as HTMLTextAreaElement).value)}
                placeholder="e.g. 100 metre black cotton jersey, 180 GSM, 60 inch, Delhi"
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setText(SAMPLE_VOICE_TEXT)}>
                <Mic className="h-4 w-4" aria-hidden /> {t("trySampleVoice")}
              </Button>
              <Button size="sm" disabled={!text.trim()} onClick={() => runParse(text)}>
                <Sparkles className="h-4 w-4" aria-hidden /> {t("analyse")}
              </Button>
            </div>

            {parsed && !parsed.understood ? <Note tone="warning">{t("notUnderstood")}</Note> : null}

            {parsed?.understood ? (
              <Card>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                  <p className="min-w-0 truncate text-sm font-bold text-foreground">{t("parsedCard")}</p>
                  <Pill tone="brand">{parsed.material}</Pill>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">{t("pleaseConfirm")}</p>

                <div className="mt-3 space-y-2">
                  {Object.keys(FIELD_LABELS).map((key) => (
                    <Field
                      key={key}
                      id={`d-${key}`}
                      label={lang === "hi" ? FIELD_LABELS[key][1] : FIELD_LABELS[key][0]}
                    >
                      <Input
                        id={`d-${key}`}
                        value={draft[key] ?? ""}
                        onChange={(e) => {
                          setDraft((d) => ({ ...d, [key]: e.target.value }));
                          setConfirmed(false);
                        }}
                      />
                    </Field>
                  ))}
                </div>

                {missing.length ? (
                  <div className="mt-2">
                    <Note tone="warning">
                      {t("missingInfo")}:{" "}
                      {missing.map((m) => (lang === "hi" ? FIELD_LABELS[m][1] : FIELD_LABELS[m][0])).join(", ")}
                    </Note>
                  </div>
                ) : null}

                <Button
                  className="mt-3"
                  size="lg"
                  disabled={missing.length > 0}
                  onClick={() => setConfirmed(true)}
                >
                  {t("confirmAndSearch")}
                </Button>
                <Note>
                  {lang === "hi"
                    ? "यह सिम्युलेटेड सहायता है — कोई असली AI या गुणवत्ता जाँच नहीं। कपड़े की गुणवत्ता फ़ोटो से तय नहीं की जा सकती।"
                    : "This is simulated assistance — no real AI and no quality verification. Fabric quality cannot be judged from an image."}
                </Note>
              </Card>
            ) : null}
          </div>
        ) : (
          <form className="space-y-3" onSubmit={submitForm}>
            <Field label={t("category")} id="fm-cat">
              <Select
                id="fm-cat"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value as CategoryId })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {lang === "hi" ? c.nameHi : c.nameEn}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={lang === "hi" ? "मटीरियल" : "Material"} id="fm-mat">
              <Input
                id="fm-mat"
                required
                value={form.material}
                onChange={(e) => setForm({ ...form, material: e.target.value })}
                placeholder="Cotton single jersey"
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label={t("qty")} id="fm-qty">
                <Input
                  id="fm-qty"
                  required
                  inputMode="numeric"
                  value={form.qty}
                  onChange={(e) => setForm({ ...form, qty: e.target.value.replace(/\D/g, "") })}
                />
              </Field>
              <Field label={lang === "hi" ? "यूनिट" : "Unit"} id="fm-unit">
                <Select id="fm-unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                  <option value="m">m</option>
                  <option value="pc">pc</option>
                  <option value="pack">pack</option>
                  <option value="cone">cone</option>
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="GSM" id="fm-gsm" hint={t("gsmHelp")}>
                <Input
                  id="fm-gsm"
                  inputMode="numeric"
                  value={form.gsm}
                  onChange={(e) => setForm({ ...form, gsm: e.target.value.replace(/\D/g, "") })}
                />
              </Field>
              <Field label={lang === "hi" ? "चौड़ाई (इंच)" : "Width (inch)"} id="fm-w">
                <Input
                  id="fm-w"
                  inputMode="numeric"
                  value={form.width}
                  onChange={(e) => setForm({ ...form, width: e.target.value.replace(/\D/g, "") })}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label={lang === "hi" ? "रंग" : "Colour"} id="fm-col">
                <Input id="fm-col" value={form.colour} onChange={(e) => setForm({ ...form, colour: e.target.value })} />
              </Field>
              <Field label={lang === "hi" ? "फ़िनिश" : "Finish"} id="fm-fin">
                <Input id="fm-fin" value={form.finish} onChange={(e) => setForm({ ...form, finish: e.target.value })} />
              </Field>
            </div>
            <Field label={lang === "hi" ? "कितने दिनों में चाहिए" : "Needed within (days)"} id="fm-days">
              <Input
                id="fm-days"
                inputMode="numeric"
                value={form.days}
                onChange={(e) => setForm({ ...form, days: e.target.value.replace(/\D/g, "") })}
              />
            </Field>
            <Button type="submit" size="lg">
              {t("sendToSuppliers")}
            </Button>
          </form>
        )}
      </div>

      {confirmed ? (
        <>
          <SectionTitle>
            {matches.length
              ? lang === "hi"
                ? "मेल खाते मटीरियल"
                : "Matching materials"
              : t("noMatch")}
          </SectionTitle>
          <div className="space-y-2 px-4">
            {matches.length === 0 ? (
              <>
                <Empty>{t("noMatch")}</Empty>
                <Button size="lg" onClick={submitToSuppliers} disabled={Boolean(sentId)}>
                  {t("sendToSuppliers")}
                </Button>
              </>
            ) : (
              <>
                {matches.map((m) => (
                  <Link
                    key={m.product.id}
                    to="/sourcing/product/$productId"
                    params={{ productId: m.product.id }}
                  >
                    <Card>
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                        <p className="min-w-0 text-sm font-semibold text-foreground">
                          {lang === "hi" ? m.product.nameHi : m.product.nameEn}
                        </p>
                        <Pill tone={m.feasible ? "positive" : "warning"}>
                          {m.feasible ? (lang === "hi" ? "समय पर" : "On time") : lang === "hi" ? "देर" : "Late"}
                        </Pill>
                      </div>
                      <p className="mt-1 text-[11px] font-semibold text-foreground">{t("whyThisMatch")}</p>
                      <ul className="list-inside list-disc text-[11px] text-muted-foreground">
                        {(lang === "hi" ? m.reasonsHi : m.reasonsEn).map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </Card>
                  </Link>
                ))}
                <Button variant="outline" size="lg" onClick={submitToSuppliers} disabled={Boolean(sentId)}>
                  {t("sendToSuppliers")}
                </Button>
              </>
            )}
            {sentId ? (
              <Note tone="brand">
                {t("requirementSent")} · {sentId}
              </Note>
            ) : null}
          </div>
        </>
      ) : null}

      {!confirmed && sentId ? (
        <div className="px-4 pt-3">
          <Note tone="brand">
            {t("requirementSent")} · {sentId}
          </Note>
        </div>
      ) : null}

      <div className="h-6" />
    </Screen>
  );
}
