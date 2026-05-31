import { Link } from "@tanstack/react-router";
import { Moon, Sun, Phone, MessageCircle } from "lucide-react";
import { useTheme } from "@/lib/theme";

export function Header({ title = "Reflect" }: { title?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <header className="sticky top-0 z-30 glass">
      <div className="mx-auto max-w-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="size-9 grid place-items-center rounded-full bg-secondary/60 text-foreground hover:bg-accent transition"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <a
            href="https://wa.me/201013701405"
            target="_blank"
            rel="noopener"
            aria-label="WhatsApp"
            className="size-9 grid place-items-center rounded-full bg-secondary/60 text-success hover:bg-accent transition"
          >
            <MessageCircle className="size-4" />
          </a>
          <a
            href="tel:01013701405"
            aria-label="Call"
            className="size-9 grid place-items-center rounded-full bg-secondary/60 text-primary hover:bg-accent transition"
          >
            <Phone className="size-4" />
          </a>
        </div>
        <Link to="/" className="flex items-center gap-2">
          <h1 className="text-xl font-bold gradient-text tracking-tight">{title}</h1>
        </Link>
      </div>
    </header>
  );
}
