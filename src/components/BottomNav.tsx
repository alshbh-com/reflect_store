import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LayoutGrid, Search, ShoppingBag, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/lib/cart";

const items = [
  { to: "/", label: "الرئيسية", icon: Home },
  { to: "/categories", label: "التصنيفات", icon: LayoutGrid },
  { to: "/search", label: "البحث", icon: Search },
  { to: "/cart", label: "السلة", icon: ShoppingBag },
  { to: "/more", label: "المزيد", icon: Menu },
] as const;

export function BottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { count } = useCart();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-safe">
      <div className="mx-auto max-w-md px-3 pb-3">
        <div className="glass rounded-3xl shadow-soft px-2 py-2 flex items-center justify-between">
          {items.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? path === "/" : path.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className="relative flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-colors"
              >
                {active && (
                  <motion.div
                    layoutId="navbg"
                    className="absolute inset-1 rounded-2xl bg-gradient-to-br from-primary to-primary-glow"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <div className="relative flex flex-col items-center gap-0.5">
                  <div className="relative">
                    <Icon className={`size-5 ${active ? "text-primary-foreground" : "text-muted-foreground"}`} strokeWidth={active ? 2.4 : 1.8} />
                    {to === "/cart" && count > 0 && (
                      <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                        {count}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-medium ${active ? "text-primary-foreground" : "text-muted-foreground"}`}>
                    {label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
