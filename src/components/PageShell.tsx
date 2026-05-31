import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

export function PageShell({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div className="min-h-screen bg-background">
      <Header title={title} />
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mx-auto max-w-md pb-32"
      >
        {children}
      </motion.main>
      <BottomNav />
    </div>
  );
}
