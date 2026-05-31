import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/track")({
  head: () => ({ meta: [{ title: "تتبع الطلب — Reflect" }] }),
  component: TrackPage,
});

function TrackPage() {
  const [code, setCode] = useState("");
  return (
    <PageShell>
      <div className="px-4 pt-4 space-y-4">
        <h1 className="text-2xl font-bold">تتبع الطلب</h1>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="رقم الطلب أو كود التتبع"
          className="w-full h-12 px-4 rounded-2xl bg-card border border-border focus:border-primary outline-none"
        />
        <button className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-bold">
          تتبع
        </button>
      </div>
    </PageShell>
  );
}
