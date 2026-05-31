import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "السلة — Reflect" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, remove, setQty, total } = useCart();

  return (
    <PageShell>
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold">سلة التسوق</h1>
        <p className="text-sm text-muted-foreground mt-1">{items.length} منتج</p>
      </div>

      {items.length === 0 ? (
        <div className="px-4 mt-12 text-center">
          <div className="mx-auto size-24 rounded-full bg-secondary grid place-items-center">
            <ShoppingBag className="size-10 text-muted-foreground" />
          </div>
          <h2 className="mt-4 font-bold text-lg">سلتك فارغة</h2>
          <p className="text-sm text-muted-foreground mt-1">ابدئي التسوق الآن</p>
          <Link to="/" className="mt-6 inline-block bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-full">
            تسوّقي
          </Link>
        </div>
      ) : (
        <>
          <div className="px-4 mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 p-3 rounded-2xl bg-card border border-border/60 shadow-card">
                <div className="size-20 rounded-xl bg-muted overflow-hidden shrink-0">
                  {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : null}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold line-clamp-2">{item.name}</h3>
                  {(item.size || item.color) && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {item.size} {item.color && `· ${item.color}`}
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-primary">{item.price * item.quantity} ج.م</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setQty(item.id, item.quantity - 1)}
                        className="size-7 rounded-full bg-secondary grid place-items-center"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => setQty(item.id, item.quantity + 1)}
                        className="size-7 rounded-full bg-secondary grid place-items-center"
                      >
                        <Plus className="size-3" />
                      </button>
                      <button
                        onClick={() => remove(item.id)}
                        className="size-7 rounded-full bg-destructive/10 text-destructive grid place-items-center mr-1"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 mt-6">
            <div className="glass rounded-2xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">المجموع</span>
                <span className="font-bold">{total} ج.م</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>الشحن</span>
                <span>يُحسب عند الدفع</span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="mt-4 block text-center bg-gradient-to-l from-primary to-primary-glow text-primary-foreground font-bold py-3.5 rounded-full shadow-glow"
            >
              إتمام الطلب
            </Link>
          </div>
        </>
      )}
    </PageShell>
  );
}
