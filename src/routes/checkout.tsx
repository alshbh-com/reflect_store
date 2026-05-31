import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "إتمام الطلب — Reflect" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  return (
    <PageShell>
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold">إتمام الطلب</h1>
        <p className="text-sm text-muted-foreground mt-1">قريباً — نموذج كامل لإتمام الطلب</p>
        <Link to="/cart" className="text-primary text-sm mt-4 inline-block">← العودة للسلة</Link>
      </div>
    </PageShell>
  );
}
