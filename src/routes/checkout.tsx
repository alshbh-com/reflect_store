import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { PageShell } from "@/components/PageShell";
import { useCart } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import { trackMetaEvent } from "@/lib/meta-pixel";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "إتمام الطلب — Reflect" }] }),
  component: CheckoutPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "الاسم قصير").max(80),
  phone: z.string().trim().regex(/^01[0-9]{9}$/, "رقم موبايل غير صحيح"),
  address: z.string().trim().min(5, "العنوان قصير").max(200),
  governorate_id: z.string().uuid("اختار المحافظة"),
  notes: z.string().max(300).optional(),
});

function CheckoutPage() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", address: "", governorate_id: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);

  const { data: govs } = useQuery({
    queryKey: ["governorates"],
    queryFn: async () => {
      const { data } = await supabase.from("governorates").select("id,name,shipping_cost").order("name");
      return data ?? [];
    },
  });

  const selectedGov = govs?.find((g) => g.id === form.governorate_id);
  const shipping = Number(selectedGov?.shipping_cost ?? 0);
  const grandTotal = total + shipping;

  useEffect(() => {
    if (!items.length) return;
    trackMetaEvent("InitiateCheckout", {
      custom_data: {
        currency: "EGP",
        value: total,
        num_items: items.reduce((a, i) => a + i.quantity, 0),
        content_ids: items.map((i) => i.productId),
        contents: items.map((i) => ({ id: i.productId, quantity: i.quantity, item_price: i.price })),
        content_type: "product",
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    if (!items.length) {
      toast.error("السلة فارغة");
      return;
    }
    setSubmitting(true);
    try {
      const { data: cust, error: ce } = await supabase
        .from("customers")
        .insert({
          name: parsed.data.name,
          phone: parsed.data.phone,
          address: parsed.data.address,
          governorate_id: parsed.data.governorate_id,
          governorate: selectedGov?.name,
        })
        .select("id")
        .single();
      if (ce) throw ce;

      const { data: order, error: oe } = await supabase
        .from("orders")
        .insert({
          customer_id: cust.id,
          governorate_id: parsed.data.governorate_id,
          total_amount: total,
          shipping_cost: shipping,
          notes: parsed.data.notes || null,
          status: "pending",
        })
        .select("id,order_number,tracking_code")
        .single();
      if (oe) throw oe;

      const orderItems = items.map((it) => ({
        order_id: order.id,
        product_id: it.productId,
        quantity: it.quantity,
        price: it.price,
        size: it.size || null,
        color: it.color || null,
      }));
      const { error: ie } = await supabase.from("order_items").insert(orderItems);
      if (ie) throw ie;

      const purchaseItems = items.map((it) => ({ id: it.productId, quantity: it.quantity, item_price: it.price }));
      const purchaseValue = grandTotal;
      const purchasePhone = parsed.data.phone;
      const purchaseName = parsed.data.name;
      clear();
      setOrderNumber(order.order_number);
      trackMetaEvent("Purchase", {
        user_data: {
          phone: purchasePhone,
          external_id: String(order.id),
        },
        custom_data: {
          currency: "EGP",
          value: purchaseValue,
          order_id: order.order_number,
          content_ids: purchaseItems.map((i) => i.id),
          contents: purchaseItems,
          num_items: purchaseItems.reduce((a, i) => a + (i.quantity ?? 1), 0),
          content_type: "product",
          content_name: purchaseName,
        },
      });
    } catch (e: any) {
      toast.error(e?.message ?? "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  if (orderNumber !== null) {
    return (
      <PageShell>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-4 pt-12 text-center"
        >
          <div className="mx-auto size-20 rounded-full bg-success/15 grid place-items-center">
            <CheckCircle2 className="size-12 text-success" />
          </div>
          <h1 className="mt-5 text-2xl font-bold">تم استلام طلبك</h1>
          <p className="mt-2 text-sm text-muted-foreground">شكراً لك، سنتواصل معك قريباً لتأكيد الطلب.</p>
          <div className="mt-6 mx-auto inline-block glass rounded-2xl px-6 py-4">
            <p className="text-xs text-muted-foreground">رقم الطلب</p>
            <p className="text-2xl font-bold gradient-text mt-1">#{orderNumber}</p>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => navigate({ to: "/track" })}
              className="h-12 rounded-full bg-primary text-primary-foreground font-bold"
            >
              تتبع الطلب
            </button>
            <button
              onClick={() => navigate({ to: "/" })}
              className="h-12 rounded-full bg-secondary font-bold"
            >
              المتابعة للتسوق
            </button>
          </div>
        </motion.div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="px-4 pt-4 space-y-4">
        <h1 className="text-2xl font-bold">إتمام الطلب</h1>

        <Field label="الاسم">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
        </Field>
        <Field label="رقم الموبايل">
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            inputMode="numeric"
            placeholder="01xxxxxxxxx"
            className={inputCls}
          />
        </Field>
        <Field label="المحافظة">
          <select
            value={form.governorate_id}
            onChange={(e) => setForm({ ...form, governorate_id: e.target.value })}
            className={inputCls}
          >
            <option value="">اختار المحافظة</option>
            {govs?.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} — شحن {g.shipping_cost} ج.م
              </option>
            ))}
          </select>
        </Field>
        <Field label="العنوان بالتفصيل">
          <textarea
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            rows={3}
            className={inputCls}
          />
        </Field>
        <Field label="ملاحظات (اختياري)">
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            className={inputCls}
          />
        </Field>

        <div className="glass rounded-2xl p-4 space-y-2 text-sm">
          <Row label={`المنتجات (${items.length})`} value={`${total} ج.م`} />
          <Row label="الشحن" value={selectedGov ? `${shipping} ج.م` : "—"} />
          <div className="h-px bg-border my-2" />
          <Row label="الإجمالي" value={`${grandTotal} ج.م`} bold />
        </div>

        <button
          onClick={submit}
          disabled={submitting || !items.length}
          className="w-full h-13 py-3.5 rounded-full bg-gradient-to-l from-primary to-primary-glow text-primary-foreground font-bold shadow-glow disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="size-4 animate-spin" />}
          تأكيد الطلب
        </button>
      </div>
    </PageShell>
  );
}

const inputCls =
  "w-full px-4 py-3 rounded-2xl bg-card border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={bold ? "font-bold" : "text-muted-foreground"}>{label}</span>
      <span className={bold ? "font-bold text-primary" : ""}>{value}</span>
    </div>
  );
}
