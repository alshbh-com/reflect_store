import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function CategoriesRow() {
  const { data } = useQuery({
    queryKey: ["categories-row"],
    queryFn: async () => {
      const { data } = await supabase
        .from("categories")
        .select("id,name,image_url")
        .eq("is_active", true)
        .order("display_order")
        .limit(12);
      return data ?? [];
    },
  });

  if (!data?.length) return null;

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-base font-bold">التصنيفات</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 pb-2">
        {data.map((c) => (
          <div key={c.id} className="flex flex-col items-center gap-2 shrink-0 w-16">
            <div className="size-16 rounded-full overflow-hidden border-2 border-primary/40 bg-muted">
              {c.image_url ? (
                <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary-glow/30" />
              )}
            </div>
            <span className="text-[11px] text-center text-foreground/80 line-clamp-1 w-full">{c.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
