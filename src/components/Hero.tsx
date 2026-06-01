import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="px-4 pt-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl p-6 shadow-glow"
        style={{ background: "var(--gradient-rose)" }}
      >
        <div className="absolute -top-10 -left-10 size-40 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-12 -right-8 size-48 rounded-full bg-white/15 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 bg-white/25 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            <Sparkles className="size-3.5" />
            مجموعة فاخرة
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white leading-tight">
            لأن الجمال
            <br />
            <span className="text-white/90">مش شكل وبس</span>
          </h2>
          <p className="mt-2 text-sm text-white/85 max-w-[280px]">
            ده إحساس، عناية وستايل — بجودة تليق بيك وبيكِ.
          </p>
          <button className="mt-5 bg-white text-primary font-bold text-sm px-5 py-2.5 rounded-full shadow-lg hover:scale-105 transition-transform">
            تسوّق الآن
          </button>
        </div>
      </motion.div>
    </section>
  );
}
