import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { Phone, ExternalLink, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/fight-back")({
  head: () => ({ meta: [{ title: "Fight Back Guide — File a Thai Labor Complaint" }] }),
  component: FightBack,
});

const STEPS = [
  { title: "1. Gather evidence first", body: "Pay slips, contract, work-permit, chat screenshots, the termination email or recording. Timestamp everything. The Evidence Locker can hash-seal them." },
  { title: "2. File with DLPW (free)", body: "Department of Labour Protection & Welfare. Fill form Kor.Sor.7 at any provincial DLPW office. They mediate within 60 days. No lawyer required." },
  { title: "3. SSO claim if injured / sick / unemployed", body: "Social Security Office: unemployment 50% of salary up to 6 months (severance fired) or 30% up to 3 months (resigned). File within 30 days at any SSO branch." },
  { title: "4. Lawyers Council of Thailand (free)", body: "If DLPW mediation fails, the Lawyers Council provides free representation in Labour Court for income < ฿20k/month. Phone +66 2 522 7124." },
  { title: "5. Labour Court", body: "If owed > severance, file directly. No filing fee. Statute of limitations: 2 years for most labor claims." },
];

const HOTLINES = [
  { name: "DLPW Hotline", phone: "1546", note: "Department of Labour Protection & Welfare" },
  { name: "SSO Hotline", phone: "1506", note: "Social Security Office (press 1 for English)" },
  { name: "Tourist Police", phone: "1155", note: "English-speaking, 24/7" },
  { name: "Lawyers Council", phone: "+66 2 522 7124", note: "Free legal aid" },
];

function FightBack() {
  return (
    <PageShell
      eyebrow="Guide · Fight Back"
      title="How to file a labor complaint in Thailand"
      description="Step-by-step playbook for foreign workers. All channels are free of charge."
    >
      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
        <ol className="space-y-4">
          {STEPS.map((s) => (
            <li key={s.title} className="glass rounded-2xl p-6">
              <h3 className="font-semibold text-lg flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-success" /> {s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            </li>
          ))}
        </ol>

        <aside className="space-y-4">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm uppercase tracking-[0.18em] text-primary font-semibold">Hotlines</h3>
            <ul className="mt-4 space-y-3">
              {HOTLINES.map((h) => (
                <li key={h.name} className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-primary mt-1 shrink-0" />
                  <div>
                    <a href={`tel:${h.phone.replace(/\s/g, "")}`} className="font-semibold hover:text-primary">{h.phone}</a>
                    <div className="text-xs text-muted-foreground">{h.name} — {h.note}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm uppercase tracking-[0.18em] text-primary font-semibold">Official portals</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li><a href="https://www.labour.go.th" target="_blank" rel="noreferrer" className="hover:text-primary inline-flex items-center gap-2">Ministry of Labour <ExternalLink className="h-3 w-3" /></a></li>
              <li><a href="https://www.sso.go.th" target="_blank" rel="noreferrer" className="hover:text-primary inline-flex items-center gap-2">Social Security Office <ExternalLink className="h-3 w-3" /></a></li>
              <li><a href="https://www.lawyerscouncil.or.th" target="_blank" rel="noreferrer" className="hover:text-primary inline-flex items-center gap-2">Lawyers Council of Thailand <ExternalLink className="h-3 w-3" /></a></li>
            </ul>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
