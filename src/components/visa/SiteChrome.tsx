import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";

export function SiteNav({ overlay = false }: { overlay?: boolean }) {
  const linkCls = overlay ? "text-hero-foreground/90 hover:text-hero-foreground" : "text-foreground/80 hover:text-foreground";
  return (
    <header className={overlay ? "absolute inset-x-0 top-0 z-20 p-4" : "border-b bg-background p-4"}>
      <nav className={`mx-auto flex max-w-6xl items-center justify-between rounded-full px-5 py-3 ${overlay ? "glass" : ""}`} aria-label="Main">
        <Link to="/" className={`flex items-center gap-2 font-display text-xl font-semibold ${overlay ? "text-hero-foreground" : "text-foreground"}`}>
          <Compass className="h-5 w-5" aria-hidden /> VisaPath
        </Link>
        <div className="flex items-center gap-5 text-sm font-medium">
          <Link to="/" className={linkCls}>Check</Link>
          <Link to="/countries" className={linkCls}>Countries</Link>
          <Link to="/admin" className={linkCls}>Sources</Link>
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t bg-secondary px-4 py-10 text-sm text-muted-foreground">
      <div className="mx-auto max-w-6xl space-y-2">
        <p className="font-display text-lg text-foreground">VisaPath</p>
        <p>Informational only — immigration authorities make all final decisions. We never collect passport numbers, scans or payment cards.</p>
        <p>Coverage is partial: not every nationality/destination combination has verified data.</p>
      </div>
    </footer>
  );
}
