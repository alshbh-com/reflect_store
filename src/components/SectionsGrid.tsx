import { Link } from "@tanstack/react-router";
import { Baby, Sparkles, Palette, Droplets } from "lucide-react";

const sections = [
  { key: "kids", label: "ملابس أطفال", icon: Baby, tint: "from-rose-400/20 to-amber-300/20" },
  { key: "women", label: "ملابس حريمي", icon: Sparkles, tint: "from-fuchsia-400/20 to-rose-300/20" },
  { key: "makeup", label: "مكياج", icon: Palette, tint: "from-amber-400/25 to-rose-300/20" },
  { key: "hair", label: "زيوت شعر", icon: Droplets, tint: "from-orange-300/25 to-rose-400/20" },
];

export function SectionsGrid() {
  return (
    <section className="px-4 mt-6">
      <div className="grid grid-cols-2 gap-3">
        {sections.map((s) => (
          <Link
            key={s.key}
            to="/categories"
            className={`relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${s.tint} border border-border/60 hover:shadow-soft transition`}
          >
            <div className="size-10 rounded-xl glass grid place-items-center mb-3">
              <s.icon className="size-5 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-foreground">{s.label}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">تسوّق الآن</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
