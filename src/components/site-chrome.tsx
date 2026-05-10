import { Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";

const NAV = [
  { to: "/calculator", label: "Calculator" },
  { to: "/contract-scan", label: "Contract Scan" },
  { to: "/ot-tax", label: "OT & Tax" },
  { to: "/fight-back", label: "Fight Back" },
  { to: "/documents", label: "Documents" },
  { to: "/justice-map", label: "Justice Map" },
  { to: "/chat", label: "AI Assistant" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 glass border-b border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-shield grid place-items-center glow">
            <Shield className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="text-sm font-semibold tracking-tight">The Labor Shield</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Thailand 2026</div>
          </div>
        </Link>
        <nav className="hidden lg:flex items-center gap-1 text-sm">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface/60 transition-colors"
              activeProps={{ className: "px-3 py-2 rounded-lg text-foreground bg-surface/80" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/chat"
          className="lg:hidden text-xs px-3 py-2 rounded-lg bg-gradient-primary text-primary-foreground font-medium"
        >
          AI Help
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 text-xs text-muted-foreground flex flex-col sm:flex-row justify-between gap-4">
        <p>© 2026 The Labor Shield · Free legal-tech for foreign workers in Thailand</p>
        <p>Information only — not a substitute for licensed legal counsel.</p>
      </div>
    </footer>
  );
}
