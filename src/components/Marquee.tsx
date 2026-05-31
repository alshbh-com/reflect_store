export function Marquee({ messages }: { messages: string[] }) {
  const text = messages.join("  ✦  ");
  return (
    <div className="overflow-hidden bg-gradient-to-l from-primary/15 via-primary/8 to-primary/15 border-y border-primary/15">
      <div className="flex whitespace-nowrap py-2 animate-marquee">
        <span className="px-6 text-sm font-medium text-foreground/80">{text}</span>
        <span className="px-6 text-sm font-medium text-foreground/80">{text}</span>
      </div>
    </div>
  );
}
