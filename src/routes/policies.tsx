import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/policies")({
  head: () => ({ meta: [{ title: "السياسات — Reflect" }] }),
  component: () => (
    <PageShell>
      <div className="px-4 pt-4 space-y-4">
        <h1 className="text-2xl font-bold">السياسات</h1>
        <div className="rounded-2xl bg-card border border-border/60 p-4 space-y-3 text-sm">
          <div>
            <h3 className="font-bold">الاستبدال</h3>
            <p className="text-muted-foreground mt-1">يمكن الاستبدال خلال 7 أيام من تاريخ الاستلام.</p>
          </div>
          <div>
            <h3 className="font-bold">الاسترداد</h3>
            <p className="text-muted-foreground mt-1">لا يوجد استرداد نقدي — استبدال فقط.</p>
          </div>
          <div>
            <h3 className="font-bold">التوصيل</h3>
            <p className="text-muted-foreground mt-1">2-3 أيام عمل لكل المحافظات.</p>
          </div>
          <div>
            <h3 className="font-bold">التواصل</h3>
            <p className="text-muted-foreground mt-1">اتصال: +201099068412 — واتساب: +201099068412</p>
          </div>
        </div>
      </div>
    </PageShell>
  ),
});
