import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/PageShell";
import { ProductCard } from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/ax")({
  head: () => ({ meta: [{ title: "إكسسوارات" }, { name: "robots", content: "noindex" }] }),
  component: AxPage,
});

function AxPage() {
  const { data } = useQuery({
    queryKey: ["accessories"],
    queryFn: async () => {
      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .ilike("name", "%إكسسوار%")
        .maybeSingle();
      if (!cat) return [];
      const { data } = await supabase
        .from("products")
        .select("id,name,price,offer_price,is_offer,image_url,stock")
        .eq("category_id", cat.id)
        .eq("is_active", true);
      return data ?? [];
    },
  });

  return (
    <PageShell>
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold">إكسسوارات</h1>
        <p className="text-sm text-muted-foreground mt-1">قسم مخصص</p>
      </div>
      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        {data?.length
          ? data.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
          : <div className="col-span-2 text-center py-12 text-muted-foreground text-sm">لا توجد منتجات</div>}
      </div>
    </PageShell>
  );
}
