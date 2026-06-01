import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/categories")({
  head: () => ({ meta: [{ title: "التصنيفات — Reflect" }] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["categories-all"],
    queryFn: async () => {
      const { data } = await supabase
        .from("categories")
        .select("id,name,image_url")
        .eq("is_active", true)
        .order("display_order");
      return data ?? [];
    },
  });

  return (
    <PageShell>
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold">التصنيفات</h1>
        <p className="text-sm text-muted-foreground mt-1">اختار قسمك المفضل</p>
      </div>
      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-2xl skeleton" />
            ))
          : data?.map((c) => (
              <Link
                key={c.id}
                to="/"
                className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border/60 shadow-card group"
              >
                {c.image_url ? (
                  <img src={c.image_url} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary-glow/20" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 right-3 text-white font-bold text-sm">{c.name}</span>
              </Link>
            ))}
        {!isLoading && !data?.length && (
          <div className="col-span-2 text-center py-12 text-muted-foreground text-sm">لا توجد تصنيفات</div>
        )}
      </div>
    </PageShell>
  );
}
