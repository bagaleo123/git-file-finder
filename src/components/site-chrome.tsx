import { Link } from "@tanstack/react-router";
import { Shield, LogIn, Briefcase, Globe } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { DonateInline } from "@/components/donate-widget";
import { useLang, LANG_LABELS, type Lang } from "@/lib/i18n";

function useNav() {
  const { t } = useLang();
  return [
    { to: "/calculator", label: t("nav.calculator") },
    { to: "/contract-scan", label: t("nav.scan") },
    { to: "/ot-tax", label: t("nav.ottax") },
    { to: "/fight-back", label: t("nav.fight") },
    { to: "/documents", label: t("nav.docs") },
    { to: "/justice-map", label: t("nav.map") },
    { to: "/chat", label: t("nav.chat") },
  ] as const;
}

function LangSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <label className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Globe className="h-3.5 w-3.5" />
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as Lang)}
        className="bg-transparent border border-border/60 rounded-md px-2 py-1 text-xs focus:outline-none focus:border-primary/60"
      >
        {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
          <option key={l} value={l} className="bg-background">{LANG_LABELS[l]}</option>
        ))}
      </select>
    </label>
  );
}

export function SiteHeader() {
  const { user } = useAuth();
  const { t } = useLang();
  const NAV = useNav();
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
          <LangSwitcher />
          {user ? (
            <Link to="/cases" className="text-xs px-3 py-2 rounded-lg bg-gradient-primary text-primary-foreground font-semibold inline-flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" /> {t("nav.cases")}
            </Link>
          ) : (
            <Link to="/login" className="text-xs px-3 py-2 rounded-lg bg-gradient-primary text-primary-foreground font-semibold inline-flex items-center gap-1.5">
              <LogIn className="h-3.5 w-3.5" /> {t("nav.signin")}
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
