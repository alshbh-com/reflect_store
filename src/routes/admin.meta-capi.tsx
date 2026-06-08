import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, CheckCircle2, AlertCircle, ExternalLink, Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import {
  getMetaCapiStatus,
  sendMetaCapiEvent,
  updateMetaSettings,
  getMetaEventLogs,
} from "@/lib/meta-capi.functions";

export const Route = createFileRoute("/admin/meta-capi")({
  head: () => ({ meta: [{ title: "إعدادات Meta CAPI" }, { name: "robots", content: "noindex" }] }),
  component: MetaCapiSettings,
});

const TOKEN_KEY = "reflect-admin-token";

function fireBrowserPixel(pixelId: string, eventId: string) {
  if (typeof window === "undefined" || !pixelId.trim()) return false;
  const w = window as any;
  if (!w.fbq) return false;
  try {
    w.fbq("init", pixelId.trim());
    w.fbq("track", "PageView", {}, { eventID: eventId });
    return true;
  } catch (e) {
    console.warn("[meta-pixel] admin test failed", e);
    return false;
  }
}

function MetaCapiSettings() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => setAuthed(!!localStorage.getItem(TOKEN_KEY)), []);

  const fetchStatus = useServerFn(getMetaCapiStatus);
  const fireTest = useServerFn(sendMetaCapiEvent);
  const saveSettings = useServerFn(updateMetaSettings);
  const fetchLogs = useServerFn(getMetaEventLogs);

  const statusQ = useQuery({
    queryKey: ["meta-capi-status"],
    queryFn: () => fetchStatus({ data: undefined as any }),
    enabled: authed,
  });
  const logsQ = useQuery({
    queryKey: ["meta-event-logs"],
    queryFn: () => fetchLogs({ data: undefined as any }),
    enabled: authed,
    refetchInterval: 5000,
  });

  const [pixelId, setPixelId] = useState("");
  const [testCode, setTestCode] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    if (statusQ.data) {
      setPixelId(statusQ.data.pixel_id ?? "");
      setTestCode(statusQ.data.test_event_code ?? "");
    }
  }, [statusQ.data]);

  const save = async () => {
    setSaving(true);
    try {
      const r = await saveSettings({
        data: {
          pixel_id: pixelId.trim(),
          test_event_code: testCode.trim() || null,
          ...(accessToken.trim() ? { access_token: accessToken.trim() } : {}),
        },
      });
      if ((r as any).ok) {
        const eventId = `admin_save_${Date.now()}`;
        const browserOk = fireBrowserPixel(pixelId, eventId);
        fireTest({
          data: {
            event_name: "PageView",
            event_id: eventId,
            event_source_url: window.location.href,
          } as any,
        }).finally(() => logsQ.refetch());
        toast.success(browserOk ? "تم الحفظ وتشغيل البكسل" : "تم الحفظ — أعد تحميل الصفحة لاختبار البكسل");
        setResult(
          browserOk
            ? `تم إرسال PageView من المتصفح إلى Pixel: ${pixelId.trim()}`
            : "تم الحفظ، لكن سكربت Meta Pixel لم يكن جاهزاً في المتصفح.",
        );
        setAccessToken("");
        statusQ.refetch();
      } else {
        toast.error((r as any).message ?? "فشل الحفظ");
      }
    } finally {
      setSaving(false);
    }
  };

  const runTest = async () => {
    setTesting(true);
    setResult(null);
    try {
      const r = await fireTest({
        data: {
          event_name: "PageView",
          event_id: `test_${Date.now()}`,
          event_source_url: window.location.href,
        } as any,
      });
      setResult(JSON.stringify(r, null, 2));
      logsQ.refetch();
    } catch (e: any) {
      setResult(`خطأ: ${e?.message ?? String(e)}`);
    } finally {
      setTesting(false);
    }
  };

  if (!authed) {
    return (
      <PageShell>
        <div className="px-4 pt-12 text-center text-sm text-muted-foreground">
          سجّل الدخول من <a href="/admin" className="text-primary underline">لوحة التحكم</a> أولاً.
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="px-4 pt-4 pb-10 space-y-5 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold">إعدادات Meta Conversions API</h1>

        <div className="glass rounded-2xl p-4 space-y-3">
          <h2 className="font-bold text-sm">حالة الإعداد</h2>
          {statusQ.isLoading ? (
            <Loader2 className="size-5 animate-spin text-primary" />
          ) : (
            <>
              <StatusRow ok={!!statusQ.data?.pixel_id} label="Pixel ID" value={statusQ.data?.pixel_id ?? "غير محدد"} />
              <StatusRow
                ok={!!statusQ.data?.token_configured}
                label="Access Token"
                value={statusQ.data?.token_configured ? "محفوظ في Secrets ✓" : "لم يُضبط بعد"}
              />
              <StatusRow
                ok={true}
                label="Test Event Code"
                value={statusQ.data?.test_event_code || "—"}
              />
            </>
          )}
        </div>

        <div className="glass rounded-2xl p-4 space-y-3">
          <h2 className="font-bold text-sm">تعديل الإعدادات</h2>
          <label className="block text-xs">
            <span className="text-muted-foreground">Pixel / Dataset ID</span>
            <input
              value={pixelId}
              onChange={(e) => setPixelId(e.target.value)}
              placeholder="1709412439635775"
              className="mt-1 w-full px-3 py-2 rounded-xl bg-card border border-border text-sm"
              dir="ltr"
            />
          </label>
          <label className="block text-xs">
            <span className="text-muted-foreground">Test Event Code (اختياري)</span>
            <input
              value={testCode}
              onChange={(e) => setTestCode(e.target.value)}
              placeholder="TEST12345"
              className="mt-1 w-full px-3 py-2 rounded-xl bg-card border border-border text-sm"
              dir="ltr"
            />
          </label>
          <label className="block text-xs">
            <span className="text-muted-foreground">
              Access Token (CAPI) — اتركه فارغاً لإبقاء الحالي
            </span>
            <input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="EAA..."
              autoComplete="off"
              className="mt-1 w-full px-3 py-2 rounded-xl bg-card border border-border text-sm"
              dir="ltr"
            />
          </label>
          <button
            onClick={save}
            disabled={saving}
            className="w-full h-11 rounded-full bg-primary text-primary-foreground font-bold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            حفظ
          </button>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            يمكنك إدارة Pixel ID والـ Access Token من هنا مباشرة — يطبَّق فوراً على CAPI، وبكسل المتصفح يتحدث عند إعادة تحميل الصفحة.
          </p>
        </div>

        <div className="glass rounded-2xl p-4 space-y-3">
          <h2 className="font-bold text-sm">اختبار حدث (Test Events)</h2>
          <button
            onClick={runTest}
            disabled={testing}
            className="w-full h-11 rounded-full bg-secondary text-foreground font-bold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {testing && <Loader2 className="size-4 animate-spin" />}
            إرسال PageView تجريبي
          </button>
          {result && (
            <pre className="text-[11px] bg-card border border-border rounded-xl p-2 overflow-auto max-h-48 whitespace-pre-wrap break-all">
              {result}
            </pre>
          )}
          <a
            href="https://business.facebook.com/events_manager2"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary"
          >
            فتح Events Manager <ExternalLink className="size-3" />
          </a>
        </div>

        <div className="glass rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm">آخر 50 حدث</h2>
            <button onClick={() => logsQ.refetch()} className="text-xs text-muted-foreground inline-flex items-center gap-1">
              <RefreshCw className="size-3" /> تحديث
            </button>
          </div>
          <div className="space-y-1.5 max-h-96 overflow-auto">
            {(logsQ.data?.logs ?? []).map((l: any) => (
              <div key={l.id} className="text-[11px] flex items-center gap-2 border border-border rounded-lg px-2 py-1.5">
                <span
                  className={`size-2 rounded-full shrink-0 ${
                    l.status === "success" ? "bg-success" : l.status === "skipped" ? "bg-muted-foreground" : "bg-destructive"
                  }`}
                />
                <span className="font-semibold w-24 shrink-0" dir="ltr">{l.event_name}</span>
                <span className="text-muted-foreground shrink-0" dir="ltr">{l.http_status ?? "—"}</span>
                <span className="truncate flex-1 text-muted-foreground" dir="ltr" title={l.message ?? ""}>
                  {l.message ?? l.event_id}
                </span>
                <span className="text-muted-foreground shrink-0" dir="ltr">
                  {new Date(l.created_at).toLocaleTimeString()}
                </span>
              </div>
            ))}
            {!logsQ.isLoading && (logsQ.data?.logs ?? []).length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">لا توجد أحداث بعد.</p>
            )}
          </div>
        </div>

        <div className="glass rounded-2xl p-4 space-y-2 text-sm">
          <h2 className="font-bold">الأحداث المدعومة</h2>
          <ul className="text-muted-foreground text-xs grid grid-cols-2 gap-2">
            <li>• PageView</li>
            <li>• ViewContent</li>
            <li>• AddToCart</li>
            <li>• InitiateCheckout</li>
            <li>• Purchase</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-2">
            كل حدث يُرسل بـ <code className="px-1 bg-secondary rounded">event_id</code> موحّد بين Pixel و CAPI لمنع الازدواجية.
          </p>
        </div>
      </div>
    </PageShell>
  );
}

function StatusRow({ ok, label, value }: { ok: boolean; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        {ok ? <CheckCircle2 className="size-4 text-success" /> : <AlertCircle className="size-4 text-destructive" />}
        <span className="font-semibold">{label}</span>
      </div>
      <span className="text-xs text-muted-foreground truncate max-w-[180px]" dir="ltr">{value}</span>
    </div>
  );
}
