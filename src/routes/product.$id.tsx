import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Zap, Share2, Star, ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/product/$id")({
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { add } = useCart();
  const [imgIdx, setImgIdx] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      return data;
    },
  });

  const { data: images } = useQuery({
    queryKey: ["product-images", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("product_images")
        .select("image_url")
        .eq("product_id", id)
        .order("display_order");
      return data ?? [];
    },
  });

  if (isLoading) {
    return (
      <PageShell>
        <div className="aspect-square skeleton" />
        <div className="px-4 mt-4 space-y-3">
          <div className="h-6 w-2/3 skeleton rounded" />
          <div className="h-4 w-1/2 skeleton rounded" />
          <div className="h-20 skeleton rounded" />
        </div>
      </PageShell>
    );
  }

  if (!product) {
    return (
      <PageShell>
        <div className="px-4 pt-10 text-center">
          <h2 className="font-bold">لم يتم العثور على المنتج</h2>
          <Link to="/" className="text-primary text-sm mt-2 inline-block">العودة للرئيسية</Link>
        </div>
      </PageShell>
    );
  }

  const gallery = [product.image_url, ...(images?.map((i) => i.image_url) ?? [])].filter(Boolean) as string[];
  const finalPrice = product.is_offer && product.offer_price ? Number(product.offer_price) : Number(product.price);
  const hasDiscount = product.is_offer && product.offer_price && Number(product.offer_price) < Number(product.price);
  const discountPct = hasDiscount
    ? Math.round(((Number(product.price) - Number(product.offer_price)) / Number(product.price)) * 100)
    : 0;

  const handleAdd = () => {
    add({ productId: product.id, name: product.name, price: finalPrice, image: product.image_url });
    toast.success("تمت الإضافة للسلة");
  };

  const handleShare = async () => {
    try {
      await navigator.share?.({ title: product.name, url: window.location.href });
    } catch {}
  };

  return (
    <PageShell>
      <div className="relative">
        <div className="aspect-square bg-muted overflow-hidden">
          {gallery[imgIdx] ? (
            <motion.img
              key={imgIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={gallery[imgIdx]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-accent to-muted" />
          )}
        </div>
        {gallery.length > 1 && (
          <>
            <button
              onClick={() => setImgIdx((i) => (i - 1 + gallery.length) % gallery.length)}
              aria-label="السابق"
              className="absolute top-1/2 -translate-y-1/2 right-2 size-9 rounded-full bg-background/70 backdrop-blur grid place-items-center shadow-soft"
            >
              <ChevronRight className="size-5" />
            </button>
            <button
              onClick={() => setImgIdx((i) => (i + 1) % gallery.length)}
              aria-label="التالي"
              className="absolute top-1/2 -translate-y-1/2 left-2 size-9 rounded-full bg-background/70 backdrop-blur grid place-items-center shadow-soft"
            >
              <ChevronLeft className="size-5" />
            </button>
            <span className="absolute top-3 left-3 text-[11px] font-bold bg-background/75 backdrop-blur px-2 py-1 rounded-full">
              {imgIdx + 1} / {gallery.length}
            </span>
            <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
              {gallery.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`h-1.5 rounded-full transition-all ${i === imgIdx ? "w-6 bg-primary" : "w-1.5 bg-white/70"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {gallery.length > 1 && (
        <div className="px-4 mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {gallery.map((src, i) => (
            <button
              key={i}
              onClick={() => setImgIdx(i)}
              className={`shrink-0 size-16 rounded-xl overflow-hidden border-2 transition ${
                i === imgIdx ? "border-primary shadow-soft" : "border-border/60 opacity-70"
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="px-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold leading-tight flex-1">{product.name}</h1>
          <button onClick={handleShare} className="size-9 rounded-full bg-secondary grid place-items-center shrink-0">
            <Share2 className="size-4" />
          </button>
        </div>

        <div className="mt-2 flex items-center gap-1 text-amber-500">
          <Star className="size-4 fill-current" />
          <Star className="size-4 fill-current" />
          <Star className="size-4 fill-current" />
          <Star className="size-4 fill-current" />
          <Star className="size-4 fill-current" />
          <span className="text-xs text-muted-foreground mr-1">(4.8)</span>
        </div>

        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-2xl font-bold text-primary">{finalPrice} ج.م</span>
          {hasDiscount && (
            <>
              <span className="text-base text-muted-foreground line-through">{product.price}</span>
              <span className="text-xs font-bold bg-destructive text-destructive-foreground px-2 py-1 rounded-full">
                -{discountPct}%
              </span>
            </>
          )}
        </div>

        {product.stock !== null && product.stock > 0 && product.stock <= 5 && (
          <p className="mt-2 text-xs font-semibold text-destructive">⚡ باقي {product.stock} قطع فقط</p>
        )}

        {product.description && (
          <div className="mt-5">
            <h3 className="text-sm font-bold mb-2">الوصف</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-24 inset-x-0 z-20 px-4 pointer-events-none">
        <div className="mx-auto max-w-md flex gap-2 pointer-events-auto">
          <button
            onClick={handleAdd}
            className="flex-1 h-12 rounded-full bg-card border-2 border-primary text-primary font-bold flex items-center justify-center gap-2 shadow-soft"
          >
            <ShoppingBag className="size-4" />
            للسلة
          </button>
          <Link
            to="/checkout"
            onClick={handleAdd}
            className="flex-1 h-12 rounded-full bg-gradient-to-l from-primary to-primary-glow text-primary-foreground font-bold flex items-center justify-center gap-2 shadow-glow"
          >
            <Zap className="size-4" />
            اطلب الآن
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
