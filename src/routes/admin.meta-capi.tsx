import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { getMetaCapiStatus, sendMetaCapiEvent } from "@/lib/meta-capi.functions";

export const Route = createFileRoute("/admin/meta-capi")({
  head: () => ({ meta: [{ title: "إعدادات Meta CAPI" }, { name: "robots", content: "noindex" }] }),
  component: MetaCapiSettings,
});

const TOKEN_KEY = "reflect-admin-token";

function MetaCapiSettings() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => setAuthed(!!localStorage.getItem(TOKEN_KEY)), []);

  const fetchStatus = useServerFn(getMetaCapiStatus);
  const fireTest = useServerFn(sendMetaCapiEvent);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["meta-capi-status"],
    queryFn: () => fetchStatus({ data: undefined as any }),
    enabled: authed,
  });

  const [testCode, setTestCode] = useState("");
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const runTest = async () => {
    setTesting(true);
    setResult(null);
    try {
      const r = await fireTest({
        data: {
          event_name: "PageView",
          event_id: `test_${Date.now()}`,
          event_source_url: window.location.href,
          test_event_code: testCode || undefined,
        } as any,
      });
      setResult(JSON.stringify(r, null, 2));
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
          {isLoading ? (
            <Loader2 className="size-5 animate-spin text-primary" />
          ) : (
            <>
              <StatusRow
                ok={!!data?.pixel_id}
                label="Pixel ID"
                value={data?.pixel_id ?? "غير محدد"}
              />
              <StatusRow
                ok={!!data?.token_configured}
                label="Access Token"
                value={data?.token_configured ? "تم الحفظ في Secrets ✓" : "لم يُضبط بعد"}
              />
            </>
          )}
        </div>

        <div className="glass rounded-2xl p-4 space-y-3 text-sm">
          <h2 className="font-bold">طريقة التعديل</h2>
          <p className="text-muted-foreground leading-relaxed">
            القيم الحساسة لا تُحفظ في الكود. لتغييرها:
          </p>
          <ul className="list-disc pr-5 space-y-1 text-muted-foreground">
            <li>
              <b>Access Token</b>: من Lovable → Project Settings → Secrets، عدّل
              <code className="px-1 bg-secondary rounded mx-1">META_CAPI_ACCESS_TOKEN</code>.
            </li>
            <li>
              <b>Pixel ID</b>: من ملف <code className="px-1 bg-secondary rounded">.env</code> عدّل
              <code className="px-1 bg-secondary rounded mx-1">VITE_META_PIXEL_ID</code> و
              <code className="px-1 bg-secondary rounded mx-1">META_PIXEL_ID</code>.
            </li>
          </ul>
        </div>

        <div className="glass rounded-2xl p-4 space-y-3">
          <h2 className="font-bold text-sm">اختبار حدث (Test Events)</h2>
          <p className="text-xs text-muted-foreground">
            افتح Events Manager → Test Events وانسخ كود الاختبار (TESTxxxx).
          </p>
          <input
            value={testCode}
            onChange={(e) => setTestCode(e.target.value)}
            placeholder="TEST12345 (اختياري)"
            className="w-full px-3 py-2 rounded-xl bg-card border border-border text-sm"
          />
          <button
            onClick={runTest}
            disabled={testing}
            className="w-full h-11 rounded-full bg-primary text-primary-foreground font-bold disabled:opacity-50 flex items-center justify-center gap-2"
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

        <button
          onClick={() => refetch()}
          className="text-xs text-muted-foreground underline"
        >
          تحديث الحالة
        </button>
      </div>
    </PageShell>
  );
}

function StatusRow({ ok, label, value }: { ok: boolean; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        {ok ? (
          <CheckCircle2 className="size-4 text-success" />
        ) : (
          <AlertCircle className="size-4 text-destructive" />
        )}
        <span className="font-semibold">{label}</span>
      </div>
      <span className="text-xs text-muted-foreground truncate max-w-[180px]" dir="ltr">{value}</span>
    </div>
  );
}
