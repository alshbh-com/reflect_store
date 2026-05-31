import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Lock, LogOut, Package, ShoppingCart, Users, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { useAppSettings } from "@/lib/use-app-settings";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "لوحة التحكم — Reflect" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

const TOKEN_KEY = "reflect-admin-token";

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (t) setAuthed(true);
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <PageShell>
        <div className="px-4 pt-12 grid place-items-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      </PageShell>
    );
  }

  return authed ? <Dashboard onLogout={() => { localStorage.removeItem(TOKEN_KEY); setAuthed(false); }} /> : <Login onSuccess={() => setAuthed(true)} />;
}

function Login({ onSuccess }: { onSuccess: () => void }) {
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!pw) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from("system_passwords")
        .select("password")
        .eq("id", "admin")
        .maybeSingle();
      if (!data) {
        toast.error("لم يتم ضبط كلمة مرور الأدمن في قاعدة البيانات");
        return;
      }
      if (data.password === pw) {
        localStorage.setItem(TOKEN_KEY, crypto.randomUUID());
        onSuccess();
        toast.success("مرحباً");
      } else {
        toast.error("كلمة المرور غير صحيحة");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <div className="px-4 pt-12 text-center max-w-sm mx-auto">
        <div className="mx-auto size-16 rounded-full bg-primary/10 grid place-items-center">
          <Lock className="size-7 text-primary" />
        </div>
        <h1 className="mt-5 text-2xl font-bold">لوحة التحكم</h1>
        <p className="mt-1 text-sm text-muted-foreground">أدخلي كلمة مرور الأدمن</p>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="كلمة المرور"
          className="mt-6 w-full h-12 px-4 rounded-2xl bg-card border border-border focus:border-primary outline-none text-center"
        />
        <button
          onClick={submit}
          disabled={loading}
          className="mt-3 w-full h-12 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          دخول
        </button>
      </div>
    </PageShell>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const { data: settings, refetch } = useAppSettings();
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setName(settings.platform_name ?? "");
      setLogoUrl(settings.logo_url ?? "");
    }
  }, [settings]);

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [orders, products, customers] = await Promise.all([
        supabase.from("orders").select("total_amount,shipping_cost", { count: "exact" }),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("customers").select("id", { count: "exact", head: true }),
      ]);
      const revenue = (orders.data ?? []).reduce(
        (s, o) => s + Number(o.total_amount ?? 0) + Number(o.shipping_cost ?? 0),
        0
      );
      return {
        orders: orders.count ?? 0,
        revenue,
        products: products.count ?? 0,
        customers: customers.count ?? 0,
      };
    },
  });

  const save = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("app_settings")
        .upsert({ id: "main", platform_name: name || "Reflect", logo_url: logoUrl || null });
      if (error) throw error;
      toast.success("تم الحفظ");
      refetch();
    } catch (e: any) {
      toast.error(e?.message ?? "خطأ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell>
      <div className="px-4 pt-4 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">لوحة التحكم</h1>
          <button onClick={onLogout} className="size-9 rounded-full bg-secondary grid place-items-center">
            <LogOut className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={ShoppingCart} label="الطلبات" value={stats?.orders ?? 0} />
          <StatCard icon={DollarSign} label="الإيرادات" value={`${stats?.revenue ?? 0} ج.م`} />
          <StatCard icon={Package} label="المنتجات" value={stats?.products ?? 0} />
          <StatCard icon={Users} label="العملاء" value={stats?.customers ?? 0} />
        </div>

        <div className="glass rounded-2xl p-4 space-y-3">
          <h2 className="font-bold">إعدادات المتجر</h2>
          <label className="block">
            <span className="text-xs text-muted-foreground mb-1 block">اسم المتجر</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-card border border-border outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground mb-1 block">رابط الشعار</span>
            <input
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 rounded-2xl bg-card border border-border outline-none focus:border-primary text-sm"
            />
          </label>
          <button
            onClick={save}
            disabled={saving}
            className="w-full h-11 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            حفظ التغييرات
          </button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          إدارة الطلبات والمنتجات والمحافظات تتم من Supabase Dashboard.
        </div>
      </div>
    </PageShell>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <div className="rounded-2xl bg-card border border-border/60 p-4">
      <div className="size-9 rounded-xl bg-primary/10 grid place-items-center mb-2">
        <Icon className="size-4 text-primary" />
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold mt-0.5">{value}</p>
    </div>
  );
}
