import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MapPin, Mic, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/app/ProductCard";
import { Screen } from "@/components/app/Shell";
import { Button, Card, Empty, Field, Input, MaterialTile, Pill, SectionTitle, Select, Sheet } from "@/components/app/ui";
import { CATEGORIES, PRODUCTS, SELLER, SUPPLIERS, getProduct } from "@/lib/demo/catalog";
import { rupees } from "@/lib/demo/money";
import { availableCredit } from "@/lib/demo/store";
import { useApp } from "@/lib/useApp";

export const Route = createFileRoute("/sourcing/")({
  head: () => ({
    meta: [
      { title: "Source raw materials — Meesho Sourcing concept" },
      {
        name: "description",
        content:
          "Search fabrics, trims, packaging and jewellery components, compare delivered prices and join open buying batches.",
      },
      { property: "og:title", content: "Source raw materials — Meesho Sourcing concept" },
      {
        property: "og:description",
        content: "Browse materials by category, filter by delivered price and origin, and join pooled batches.",
      },
    ],
  }),
  component: SourcingScreen,
});

function SourcingScreen() {
  const { s, t, lang } = useApp();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [origin, setOrigin] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [avail, setAvail] = useState("");

  const openBatches = s.batches.filter((b) => b.status === "open");

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      if (category && p.categoryId !== category) return false;
      if (origin && SUPPLIERS[p.supplierId]!.city !== origin) return false;
      const batch = s.batches.find((b) => b.id === p.batchId && b.status === "open");
      if (avail === "batch" && !batch) return false;
      if (avail === "buynow" && !p.buyNow) return false;
      if (maxPrice) {
        const unit = batch ? batch.unitPricePaise : (p.buyNow?.unitPricePaise ?? Infinity);
        if (unit > Number(maxPrice) * 100) return false;
      }
      if (!term) return true;
      const hay = [
        p.nameEn,
        p.nameHi,
        ...p.specs.map((sp) => `${sp.labelEn} ${sp.value}`),
        SUPPLIERS[p.supplierId]!.city,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(term);
    });
  }, [q, category, origin, maxPrice, avail, s.batches]);

  const activeFilters = [category, origin, maxPrice, avail].filter(Boolean).length;
  const recent = s.orders.slice(0, 3).map((o) => getProduct(o.productId)!).filter(Boolean);
  const credit = s.credit;

  return (
    <Screen title={t("nav_sourcing")} subtitle={t("soldByMeesho")}>
      <div className="space-y-3 px-4 pt-3">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
          <span className="min-w-0 truncate">
            {t("deliverTo")}: {SELLER.address}
          </span>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <label htmlFor="search" className="sr-only">
              {t("searchPlaceholder")}
            </label>
            <Input
              id="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={() => setFiltersOpen(true)} aria-label={t("filters")}>
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            {activeFilters ? <span className="num text-xs">{activeFilters}</span> : null}
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              to="/sourcing/category/$categoryId"
              params={{ categoryId: c.id }}
              className="flex flex-col items-center gap-1 text-center"
            >
              <MaterialTile swatch={c.swatch} label={c.nameEn} className="h-14 w-full" />
              <span className="text-[10px] font-semibold leading-tight text-foreground">
                {lang === "hi" ? c.nameHi : c.nameEn}
              </span>
            </Link>
          ))}
        </div>

        <button
          onClick={() => navigate({ to: "/sourcing/requirement" })}
          className="tap flex w-full items-center gap-3 rounded-xl border border-primary/30 bg-primary-soft px-3 py-3 text-left"
        >
          <Mic className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          <span className="min-w-0">
            <span className="block text-sm font-bold text-primary">{t("tellUsWhatYouNeed")}</span>
            <span className="block text-[11px] text-primary/80">{t("tellUsSub")}</span>
          </span>
        </button>

        {s.quotes.length > 0 ? (
          <Link to="/quotes">
            <Card className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
              <span className="min-w-0 truncate text-sm font-semibold text-foreground">{t("quotesReceived")}</span>
              <span className="num text-xs font-bold text-primary">{s.quotes.length}</span>
            </Card>
          </Link>
        ) : null}

        <Link to="/payments">
          <Card className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground">{t("sourcingCredit")}</p>
              <p className="num text-[11px] text-muted-foreground">
                {t("available")} {rupees(availableCredit(s))} · {t("outstanding")}{" "}
                {rupees(credit.outstandingPaise)}
              </p>
            </div>
            <Pill tone="brand">{t("details")}</Pill>
          </Card>
        </Link>
      </div>

      {q || activeFilters ? (
        <>
          <SectionTitle>
            {results.length} {lang === "hi" ? "नतीजे" : "results"}
          </SectionTitle>
          <div className="px-4">
            {results.length === 0 ? (
              <Empty>{t("noResults")}</Empty>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {results.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    batch={s.batches.find((b) => b.id === p.batchId && b.status === "open")}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <SectionTitle>{t("openBatches")}</SectionTitle>
          <div className="grid grid-cols-2 gap-2 px-4">
            {openBatches.map((b) => {
              const p = getProduct(b.productId)!;
              return <ProductCard key={b.id} product={p} batch={b} />;
            })}
          </div>

          <SectionTitle>{t("buyNowMaterials")}</SectionTitle>
          <div className="grid grid-cols-2 gap-2 px-4">
            {PRODUCTS.filter((p) => p.buyNow)
              .slice(0, 6)
              .map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
          </div>

          {recent.length ? (
            <>
              <SectionTitle>{t("recentlyPurchased")}</SectionTitle>
              <div className="grid grid-cols-2 gap-2 px-4">
                {recent.map((p, i) => (
                  <ProductCard key={`${p.id}-${i}`} product={p} />
                ))}
              </div>
            </>
          ) : null}
        </>
      )}

      <div className="h-4" />

      <Sheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title={t("filters")}
        footer={
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setCategory("");
                setOrigin("");
                setMaxPrice("");
                setAvail("");
              }}
            >
              {t("clear")}
            </Button>
            <Button className="flex-1" onClick={() => setFiltersOpen(false)}>
              {t("continue")}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <Field label={t("category")} id="f-cat">
            <Select id="f-cat" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">{t("any")}</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {lang === "hi" ? c.nameHi : c.nameEn}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("origin")} id="f-org">
            <Select id="f-org" value={origin} onChange={(e) => setOrigin(e.target.value)}>
              <option value="">{t("any")}</option>
              {Array.from(new Set(Object.values(SUPPLIERS).map((x) => x.city))).map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("maxDelivered")} id="f-price" hint="₹ per unit, material price">
            <Input
              id="f-price"
              inputMode="numeric"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, ""))}
              placeholder="e.g. 120"
            />
          </Field>
          <Field label={t("availability")} id="f-av">
            <Select id="f-av" value={avail} onChange={(e) => setAvail(e.target.value)}>
              <option value="">{t("any")}</option>
              <option value="batch">{t("buyTogether")}</option>
              <option value="buynow">{t("buyNow")}</option>
            </Select>
          </Field>
        </div>
      </Sheet>
    </Screen>
  );
}
