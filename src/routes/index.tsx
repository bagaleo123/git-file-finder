import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Calculator, FileSearch, Coins, Megaphone, FileText, MapPin, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Labor Shield — Thai Labor Law Tool for Foreign Workers (2026)" },
      { name: "description", content: "Free legal-tech for expats in Thailand. Calculate severance, scan contracts with AI, find DLPW offices, and chat with our Thai labor law assistant." },
      { property: "og:title", content: "The Labor Shield — Thailand 2026" },
      { property: "og:description", content: "Know what you're owed. Scan your contract. Take action." },
    ],
  }),
  component: Home,
});

const RIGHTS = [
  "30 fully paid sick days per year — employer cannot deny",
  "Severance pay after 120 days of employment",
  "Minimum 1 month notice (or cash in lieu) before termination",
  "Termination due to illness is illegal",
  "SSO contribution cap: ฿875/month (5% of ฿17,500)",
  "Annual leave cannot substitute sick leave",
];

const TOOLS = [
  { to: "/calculator", icon: Calculator, badge: "Thai Law 2026", title: "Severance Calculator", desc: "Enter your salary and tenure. Get exact severance, notice pay, and sick leave owed." },
  { to: "/contract-scan", icon: FileSearch, badge: "AI Powered", title: "Contract Scanner", desc: "Upload or paste your contract. AI flags illegal clauses and missing protections instantly." },
  { to: "/ot-tax", icon: Coins, badge: "Min Wage 2026", title: "OT & Tax Calculator", desc: "Calculate overtime (1.5x/2x/3x), holiday pay, SSO, and personal income tax." },
  { to: "/fight-back", icon: Megaphone, badge: "Official Channels", title: "Fight Back Guide", desc: "Step-by-step instructions to file complaints with DLPW, SSO, and the Lawyers Council." },
  { to: "/documents", icon: FileText, badge: "Bilingual", title: "Document Generator", desc: "Generate formal demand letters in English and Legal Thai, ready to send to HR." },
  { to: "/justice-map", icon: MapPin, badge: "GPS Locations", title: "Justice Map", desc: "Find DLPW offices in Bangkok, Phuket, Pattaya, and Chiang Mai with filing checklists." },
] as const;

function Home() {
  return (
    <>
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-16 sm:pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs uppercase tracking-[0.18em] text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Thai Labor Law 2026 — Updated
          </div>

          <div className="mx-auto mt-10 h-24 w-24 rounded-3xl bg-gradient-shield grid place-items-center glow animate-float">
            <Shield className="h-12 w-12 text-primary-foreground" strokeWidth={2.5} />
          </div>

          <h1 className="mt-8 text-5xl sm:text-7xl font-bold tracking-tight">
            The <span className="text-gradient">Labor Shield</span>
          </h1>
          <p className="mt-5 text-xl sm:text-2xl text-muted-foreground">Protect your rights in the Land of Smiles.</p>
          <p className="mt-5 mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground/90 leading-relaxed">
            A free legal-tech tool for foreign workers in Thailand. Know what you're owed, scan your contract for illegal clauses, and take action with confidence.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/calculator" className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-gradient-primary text-primary-foreground font-semibold glow hover:opacity-95 transition">
              <Calculator className="h-4 w-4" /> Calculate My Rights <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/contract-scan" className="inline-flex items-center gap-2 px-7 py-4 rounded-xl glass font-semibold hover:border-primary/60 transition">
              <FileSearch className="h-4 w-4" /> Scan My Contract
            </Link>
          </div>
        </div>
      </section>

      {/* RIGHTS GRID */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-surface grid place-items-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold">Your Statutory Rights at a Glance</h2>
          <span className="text-[10px] uppercase tracking-[0.2em] text-primary px-2 py-1 rounded-md bg-primary/10">2026</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {RIGHTS.map((r) => (
            <div key={r} className="glass rounded-xl px-4 py-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
              <span className="text-sm">{r}</span>
            </div>
          ))}
        </div>
      </section>

      {/* TOOLS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold">Six Tools. One Mission.</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Everything you need to understand, protect, and enforce your rights as a foreign worker in Thailand.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS.map((t) => (
            <Link key={t.to} to={t.to} className="glass rounded-2xl p-6 group hover:border-primary/60 transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between mb-5">
                <div className="h-12 w-12 rounded-xl bg-gradient-shield grid place-items-center group-hover:glow transition">
                  <t.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.18em] text-primary px-2 py-1 rounded-md bg-primary/10">{t.badge}</span>
              </div>
              <h3 className="text-lg font-semibold">{t.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
              <div className="mt-5 inline-flex items-center gap-1 text-sm text-primary font-medium">
                Open Tool <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* AI CALLOUT */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="glass rounded-3xl p-8 sm:p-12 grid md:grid-cols-[1fr_auto] gap-8 items-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="relative">
            <span className="text-[10px] uppercase tracking-[0.2em] text-primary">Powered by AI</span>
            <h3 className="mt-3 text-2xl sm:text-3xl font-bold">Talk to your Labor Shield AI</h3>
            <p className="mt-3 text-muted-foreground max-w-xl">A free, multilingual assistant trained on the Thai Labor Protection Act. Get the exact answer to your situation in seconds.</p>
          </div>
          <Link to="/chat" className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-gradient-primary text-primary-foreground font-semibold glow whitespace-nowrap">
            <Sparkles className="h-4 w-4" /> Open Assistant
          </Link>
        </div>
      </section>

      {/* WARNING */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-12">
        <div className="rounded-2xl border border-warning/40 bg-warning/5 p-6">
          <h3 className="font-semibold text-warning">Know Your Enemy: Common Employer Violations</h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            The most common violations against expat workers include: denying sick pay, demanding immediate resignation under threat, making illegal salary deductions, and termination during illness. All of these are <span className="text-foreground font-medium">prosecutable under Thai labor law</span>. The Labor Shield helps you identify and fight them.
          </p>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
