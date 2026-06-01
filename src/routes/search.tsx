import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { ProductCard } from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "البحث — Reflect" }] }),
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"new" | "asc" | "desc">("new");

  const { data, isLoading } = useQuery({
    queryKey: ["search", q, sort],
    queryFn: async () => {
      let qb = supabase
        .from("products")
        .select("id,name,price,offer_price,is_offer,image_url,stock")
        .eq("is_active", true);
      if (q.trim()) qb = qb.ilike("name", `%${q.trim()}%`);
      if (sort === "asc") qb = qb.order("price", { ascending: true });
      else if (sort === "desc") qb = qb.order("price", { ascending: false });
      else qb = qb.order("created_at", { ascending: false });
      const { data } = await qb.limit(40);
      return data ?? [];
    },
  });

  const sortOptions = useMemo(
    () => [
      { v: "new", l: "الأحدث" },
      { v: "asc", l: "السعر ↑" },
      { v: "desc", l: "السعر ↓" },
    ] as const,
    []
  );

  return (
    <PageShell>
      <div className="px-4 pt-4 space-y-3">
        <h1 className="text-2xl font-bold">البحث</h1>
        <div className="relative">
          <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث عن منتج..."
            className="w-full h-12 pr-10 pl-4 rounded-2xl bg-card border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {sortOptions.map((o) => (
            <button
              key={o.v}
              onClick={() => setSort(o.v)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                sort === o.v ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
              }`}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 mt-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square skeleton rounded-3xl" />
            ))}
          </div>
        ) : !data?.length ? (
          <div className="text-center py-12 text-muted-foreground text-sm">لا توجد نتائج</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {data.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
