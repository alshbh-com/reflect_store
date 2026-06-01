import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/install")({
  head: () => ({ meta: [{ title: "تثبيت التطبيق — Reflect" }] }),
  component: () => (
    <PageShell>
      <div className="px-4 pt-4 space-y-4">
        <h1 className="text-2xl font-bold">تثبيت التطبيق</h1>
        <div className="rounded-2xl bg-card border border-border/60 p-4 space-y-3 text-sm">
          <div>
            <h3 className="font-bold">على iPhone</h3>
            <p className="text-muted-foreground mt-1">افتح Safari → زر المشاركة → "إضافة إلى الشاشة الرئيسية".</p>
          </div>
          <div>
            <h3 className="font-bold">على Android</h3>
            <p className="text-muted-foreground mt-1">افتح Chrome → القائمة → "تثبيت التطبيق".</p>
          </div>
        </div>
      </div>
    </PageShell>
  ),
});
