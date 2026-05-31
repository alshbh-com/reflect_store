import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { SectionsGrid } from "@/components/SectionsGrid";
import { CategoriesRow } from "@/components/CategoriesRow";
import { ProductsGrid } from "@/components/ProductsGrid";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Reflect — انعكاسك يستحق الأفضل" },
      { name: "description", content: "متجر Reflect الفاخر — ملابس، مكياج، عناية بالشعر وأكثر." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <PageShell>
      <Marquee
        messages={[
          "شحن سريع لكل المحافظات",
          "خصومات تصل لـ 40% على مجموعات مختارة",
          "ضمان جودة على كل المنتجات",
          "استبدال خلال 7 أيام",
        ]}
      />
      <Hero />
      <SectionsGrid />
      <CategoriesRow />
      <ProductsGrid title="المنتجات المميزة" limit={20} />
    </PageShell>
  );
}
