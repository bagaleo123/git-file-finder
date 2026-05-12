import { Link } from "@tanstack/react-router";
import { Shield, LogIn, Briefcase } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { DonateInline } from "@/components/donate-widget";

const NAV = [
  { to: "/calculator", label: "Calculator" },
  { to: "/contract-scan", label: "Contract Scan" },
  { to: "/ot-tax", label: "OT & Tax" },
  { to: "/fight-back", label: "Fight Back" },
  { to: "/documents", label: "Documents" },
  { to: "/justice-map", label: "Justice Map" },
  { to: "/chat", label: "AI Chat" },
] as const;

export function SiteHeader() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-40 glass border-b border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="h-9 w-9 rounded-xl bg-gradient-shield grid place-items-center glow">
            <Shield className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="text-sm font-semibold tracking-tight">The Labor Shield</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Thailand 2026</div>
          </div>
        </Link>
        <nav className="hidden xl:flex items-center gap-1 text-sm">
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
        <div className="flex items-center gap-2">
          {user ? (
            <Link to="/cases" className="text-xs px-3 py-2 rounded-lg bg-gradient-primary text-primary-foreground font-semibold inline-flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" /> My Cases
            </Link>
          ) : (
            <Link to="/login" className="text-xs px-3 py-2 rounded-lg bg-gradient-primary text-primary-foreground font-semibold inline-flex items-center gap-1.5">
              <LogIn className="h-3.5 w-3.5" /> Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 grid gap-6 md:grid-cols-3 text-xs text-muted-foreground">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">The Labor Shield Thailand</span>
          </div>
          <p>Free legal-tech for foreign & Thai workers. Built on the Labor Protection Act B.E. 2541 (2026 update).</p>
        </div>
        <div>
          <div className="font-semibold text-foreground mb-2">AI disclaimer</div>
          <p>This is an AI consultant — not a licensed lawyer. Use the answers to study your case. The Labor Shield is not liable for individual outcomes.</p>
        </div>
        <div>
          <div className="font-semibold text-foreground mb-2">Support this project</div>
          <DonateInline />
        </div>
      </div>
      <div className="border-t border-border/40 py-4 text-center text-[11px] text-muted-foreground">© 2026 The Labor Shield · Free for everyone in Thailand</div>
    </footer>
  );
}
