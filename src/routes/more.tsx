import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone, MessageCircle, FileText, Download, Sparkles } from "lucide-react";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/more")({
  head: () => ({ meta: [{ title: "المزيد — Reflect" }] }),
  component: MorePage,
});

const links = [
  { to: "/track", label: "تتبع الطلب", icon: Sparkles },
  { to: "/policies", label: "سياسة الاستبدال", icon: FileText },
  { to: "/install", label: "تثبيت التطبيق", icon: Download },
] as const;

function MorePage() {
  return (
    <PageShell>
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold">المزيد</h1>
      </div>
      <div className="px-4 mt-4 space-y-2">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/60 hover:border-primary/40 transition"
          >
            <div className="size-10 rounded-xl bg-primary/10 grid place-items-center">
              <l.icon className="size-5 text-primary" />
            </div>
            <span className="font-semibold text-sm flex-1">{l.label}</span>
            <span className="text-muted-foreground">←</span>
          </Link>
        ))}
      </div>

      <div className="px-4 mt-6 grid grid-cols-2 gap-3">
        <a
          href="tel:01013701405"
          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-primary/15 to-primary-glow/10 border border-primary/20"
        >
          <Phone className="size-6 text-primary" />
          <span className="text-xs font-bold">اتصل بنا</span>
        </a>
        <a
          href="https://wa.me/201013701405"
          target="_blank"
          rel="noopener"
          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-emerald-400/10 border border-emerald-500/20"
        >
          <MessageCircle className="size-6 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold">واتساب</span>
        </a>
      </div>
    </PageShell>
  );
}
