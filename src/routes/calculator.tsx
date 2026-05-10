import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/calculator")({
  head: () => ({
    meta: [
      { title: "Severance Calculator — Thai Labor Law 2026" },
      { name: "description", content: "Calculate the exact severance, notice pay, and unused sick leave you are owed under Thai labor law." },
    ],
  }),
  component: Calculator,
});

// Thai Labor Protection Act severance scale (days of pay)
function severanceDays(months: number): number {
  if (months < 4) return 0;            // < 120 days
  if (months < 12) return 30;          // 120 d – 1 yr
  if (months < 36) return 90;          // 1–3 yrs
  if (months < 72) return 180;         // 3–6 yrs
  if (months < 120) return 240;        // 6–10 yrs
  if (months < 240) return 300;        // 10–20 yrs
  return 400;                          // 20+ yrs
}

const fmt = (n: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);

function Calculator() {
  const [salary, setSalary] = useState(60000);
  const [months, setMonths] = useState(24);
  const [unusedSickDays, setUnusedSickDays] = useState(15);
  const [noticeGiven, setNoticeGiven] = useState(false);

  const result = useMemo(() => {
    const dailyRate = salary / 30;
    const sevDays = severanceDays(months);
    const severance = dailyRate * sevDays;
    const notice = noticeGiven ? 0 : salary; // 1 month in lieu
    const sickPay = dailyRate * Math.min(unusedSickDays, 30);
    const total = severance + notice + sickPay;
    return { dailyRate, sevDays, severance, notice, sickPay, total };
  }, [salary, months, unusedSickDays, noticeGiven]);

  return (
    <PageShell
      eyebrow="Tool · Severance"
      title="Severance Calculator"
      description="Based on the Thai Labor Protection Act B.E. 2541 (updated 2026). Enter your details to see exactly what you are owed."
    >
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 space-y-5">
          <Field label="Monthly salary (฿)">
            <input type="number" value={salary} onChange={(e) => setSalary(+e.target.value || 0)} className="input" />
          </Field>
          <Field label={`Tenure: ${months} months (${(months / 12).toFixed(1)} yrs)`}>
            <input type="range" min={0} max={300} value={months} onChange={(e) => setMonths(+e.target.value)} className="w-full accent-primary" />
          </Field>
          <Field label="Unused sick days this year (max 30)">
            <input type="number" value={unusedSickDays} min={0} max={30} onChange={(e) => setUnusedSickDays(Math.min(30, +e.target.value || 0))} className="input" />
          </Field>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={noticeGiven} onChange={(e) => setNoticeGiven(e.target.checked)} className="h-4 w-4 accent-primary" />
            <span className="text-sm text-muted-foreground">Employer gave 1 month written notice</span>
          </label>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="text-xs uppercase tracking-[0.2em] text-primary">Total owed to you</div>
          <div className="mt-2 text-5xl font-bold text-gradient">฿{fmt(result.total)}</div>
          <div className="mt-6 space-y-3">
            <Row label={`Severance (${result.sevDays} days @ ฿${fmt(result.dailyRate)})`} value={result.severance} />
            <Row label={noticeGiven ? "Notice pay (waived — notice given)" : "Notice pay in lieu (1 month)"} value={result.notice} />
            <Row label={`Unused sick leave payout (${Math.min(unusedSickDays, 30)} days)`} value={result.sickPay} />
          </div>
          <p className="mt-6 text-xs text-muted-foreground leading-relaxed">
            Severance scale: &lt;120d none · 120d–1yr 30d · 1–3yr 90d · 3–6yr 180d · 6–10yr 240d · 10–20yr 300d · 20yr+ 400d. Termination due to illness is illegal and entitles you to additional damages.
          </p>
        </div>
      </div>

      <style>{`.input{width:100%;background:var(--color-input);border:1px solid var(--color-border);border-radius:.75rem;padding:.75rem 1rem;color:var(--color-foreground);outline:none}.input:focus{border-color:var(--color-primary)}`}</style>
    </PageShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 pb-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-semibold">฿{fmt(value)}</span>
    </div>
  );
}
