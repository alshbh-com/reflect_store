import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "./ProductCard";

export function ProductsGrid({ title = "كل المنتجات", limit = 20 }: { title?: string; limit?: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["products", limit],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id,name,price,offer_price,is_offer,image_url,stock")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(limit);
      return data ?? [];
    },
  });

  return (
    <section className="px-4 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold">{title}</h2>
        <span className="text-xs text-muted-foreground">{data?.length ?? 0} منتج</span>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-3xl overflow-hidden">
              <div className="aspect-square skeleton" />
              <div className="p-3 space-y-2">
                <div className="h-3 skeleton rounded" />
                <div className="h-3 w-2/3 skeleton rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : !data?.length ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          لا توجد منتجات بعد — أضيفي منتجاتك من لوحة الأدمن
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {data.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
