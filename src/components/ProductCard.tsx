import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

export type ProductLike = {
  id: string;
  name: string;
  price: number;
  offer_price?: number | null;
  is_offer?: boolean | null;
  image_url?: string | null;
  stock?: number | null;
};

export function ProductCard({ product, index = 0 }: { product: ProductLike; index?: number }) {
  const finalPrice = product.is_offer && product.offer_price ? product.offer_price : product.price;
  const hasDiscount = product.is_offer && product.offer_price && product.offer_price < product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.price - (product.offer_price ?? 0)) / product.price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.35 }}
    >
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="group block rounded-3xl bg-card shadow-card overflow-hidden border border-border/60 hover:shadow-soft transition-all"
      >
        <div className="relative aspect-square bg-muted overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-accent to-muted" />
          )}
          {hasDiscount && (
            <span className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-[11px] font-bold px-2 py-1 rounded-full shadow-md">
              -{discountPct}%
            </span>
          )}
          {product.is_offer && (
            <span className="absolute top-2 left-2 bg-gradient-to-l from-primary to-primary-glow text-primary-foreground text-[11px] font-bold px-2 py-1 rounded-full shadow-md">
              عرض
            </span>
          )}
          {typeof product.stock === "number" && product.stock > 0 && product.stock <= 3 && (
            <span className="absolute bottom-2 right-2 bg-foreground/85 text-background text-[10px] font-medium px-2 py-1 rounded-full">
              باقي {product.stock}
            </span>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 min-h-10">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center gap-1 text-amber-500">
            <Star className="size-3.5 fill-current" />
            <span className="text-xs text-muted-foreground">4.8</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base font-bold text-primary">{finalPrice} ج.م</span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">{product.price}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
