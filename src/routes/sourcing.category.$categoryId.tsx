import { createFileRoute } from "@tanstack/react-router";
import { ProductCard } from "@/components/app/ProductCard";
import { Screen } from "@/components/app/Shell";
import { Empty } from "@/components/app/ui";
import { CATEGORIES, PRODUCTS } from "@/lib/demo/catalog";
import { useApp } from "@/lib/useApp";

export const Route = createFileRoute("/sourcing/category/$categoryId")({
  head: () => ({
    meta: [
      { title: "Material category — Meesho Sourcing concept" },
      {
        name: "description",
        content: "Browse raw materials in this category with specifications, delivered prices and batch availability.",
      },
      { property: "og:title", content: "Material category — Meesho Sourcing concept" },
      { property: "og:description", content: "Category browsing for the Meesho Sourcing concept prototype." },
    ],
  }),
  component: CategoryScreen,
});

function CategoryScreen() {
  const { categoryId } = Route.useParams();
  const { s, t, lang } = useApp();
  const cat = CATEGORIES.find((c) => c.id === categoryId);
  const items = PRODUCTS.filter((p) => p.categoryId === categoryId);

  return (
    <Screen title={cat ? (lang === "hi" ? cat.nameHi : cat.nameEn) : t("nav_sourcing")} back subtitle={t("soldByMeesho")}>
      <div className="px-4 pt-3">
        {items.length === 0 ? (
          <Empty>{t("none")}</Empty>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {items.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                batch={s.batches.find((b) => b.id === p.batchId && b.status === "open")}
              />
            ))}
          </div>
        )}
      </div>
    </Screen>
  );
}
