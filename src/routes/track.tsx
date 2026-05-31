import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Package, Truck, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/track")({
  head: () => ({ meta: [{ title: "تتبع الطلب — Reflect" }] }),
  component: TrackPage,
});

const statusMap: Record<string, { label: string; icon: any; color: string }> = {
  pending: { label: "قيد المراجعة", icon: Clock, color: "text-amber-500" },
  processing: { label: "قيد التجهيز", icon: Package, color: "text-primary" },
  shipped: { label: "في الشحن", icon: Truck, color: "text-blue-500" },
  delivered: { label: "تم التوصيل", icon: CheckCircle2, color: "text-success" },
  delivered_with_modification: { label: "تم التوصيل (معدّل)", icon: CheckCircle2, color: "text-success" },
};

function TrackPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  const lookup = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setNotFound(false);
    setOrder(null);
    try {
      const trimmed = code.trim();
      const isNum = /^\d+$/.test(trimmed);
      let q = supabase.from("orders").select("order_number,status,total_amount,shipping_cost,tracking_code,created_at");
      q = isNum ? q.eq("order_number", Number(trimmed)) : q.eq("tracking_code", trimmed);
      const { data } = await q.maybeSingle();
      if (!data) setNotFound(true);
      else setOrder(data);
    } finally {
      setLoading(false);
    }
  };

  const st = order ? statusMap[order.status] ?? { label: order.status, icon: Clock, color: "text-muted-foreground" } : null;

  return (
    <PageShell>
      <div className="px-4 pt-4 space-y-4">
        <h1 className="text-2xl font-bold">تتبع الطلب</h1>
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lookup()}
            placeholder="رقم الطلب أو كود التتبع"
            className="flex-1 h-12 px-4 rounded-2xl bg-card border border-border focus:border-primary outline-none"
          />
          <button
            onClick={lookup}
            disabled={loading}
            className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center gap-2"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : "تتبع"}
          </button>
        </div>

        {notFound && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            لم نعثر على هذا الطلب — تأكدي من الرقم
          </div>
        )}

        {order && st && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`size-12 rounded-full bg-card grid place-items-center ${st.color}`}>
                <st.icon className="size-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">حالة الطلب</p>
                <p className="font-bold">{st.label}</p>
              </div>
            </div>
            <div className="h-px bg-border" />
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">رقم الطلب</span><span className="font-bold">#{order.order_number}</span></div>
              {order.tracking_code && (
                <div className="flex justify-between"><span className="text-muted-foreground">كود التتبع</span><span className="font-mono text-xs">{order.tracking_code}</span></div>
              )}
              <div className="flex justify-between"><span className="text-muted-foreground">الإجمالي</span><span>{Number(order.total_amount) + Number(order.shipping_cost)} ج.م</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">التاريخ</span><span>{new Date(order.created_at).toLocaleDateString("ar-EG")}</span></div>
            </div>
          </motion.div>
        )}
      </div>
    </PageShell>
  );
}
