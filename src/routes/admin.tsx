import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "لوحة التحكم — Reflect" }] }),
  component: () => (
    <PageShell>
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <p className="text-sm text-muted-foreground mt-2">
          محمية بكلمة مرور — قريباً.
        </p>
      </div>
    </PageShell>
  ),
});
