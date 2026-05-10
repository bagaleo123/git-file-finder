import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/ot-tax")({
  head: () => ({ meta: [{ title: "OT & Tax Calculator — Thailand 2026" }] }),
  component: OtTax,
});

const fmt = (n: number) => "฿" + new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);

// Thai progressive PIT brackets (annual, THB)
function pit(annual: number) {
  const brackets = [
    [150_000, 0],
    [300_000, 0.05],
    [500_000, 0.10],
    [750_000, 0.15],
    [1_000_000, 0.20],
    [2_000_000, 0.25],
    [5_000_000, 0.30],
    [Infinity, 0.35],
  ] as const;
  let prev = 0, tax = 0;
  for (const [cap, rate] of brackets) {
    const slice = Math.max(0, Math.min(annual, cap) - prev);
    tax += slice * rate;
    prev = cap;
    if (annual <= cap) break;
  }
  return tax;
}

function OtTax() {
  const [salary, setSalary] = useState(50000);
  const [otWeekday, setOtWeekday] = useState(10);
  const [otRestDay, setOtRestDay] = useState(0);
  const [otHoliday, setOtHoliday] = useState(0);

  const r = useMemo(() => {
    const hourly = salary / 30 / 8;
    const otWd = hourly * 1.5 * otWeekday;
    const otRd = hourly * 2 * otRestDay;
    const otHd = hourly * 3 * otHoliday;
    const grossMonthly = salary + otWd + otRd + otHd;
    const sso = Math.min(grossMonthly * 0.05, 875);
    const annualGross = grossMonthly * 12;
    const taxableAnnual = Math.max(0, annualGross - 60000 /* personal */ - 100000 /* expense max */);
    const annualTax = pit(taxableAnnual);
    const monthlyTax = annualTax / 12;
    const net = grossMonthly - sso - monthlyTax;
    return { hourly, otWd, otRd, otHd, grossMonthly, sso, monthlyTax, net, annualTax };
  }, [salary, otWeekday, otRestDay, otHoliday]);

  return (
    <PageShell
      eyebrow="Tool · OT & Tax"
      title="Overtime, SSO & Income Tax"
      description="Real-time Thai 2026 calculations: weekday OT 1.5x, rest day 2x, public holiday rest day 3x, SSO 5% capped at ฿875, progressive PIT 0–35%."
    >
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 space-y-5">
          <Field label="Monthly base salary (฿)"><input className="input" type="number" value={salary} onChange={(e) => setSalary(+e.target.value || 0)} /></Field>
          <Field label="Weekday OT hours / month (1.5x)"><input className="input" type="number" value={otWeekday} onChange={(e) => setOtWeekday(+e.target.value || 0)} /></Field>
          <Field label="Rest-day OT hours / month (2x)"><input className="input" type="number" value={otRestDay} onChange={(e) => setOtRestDay(+e.target.value || 0)} /></Field>
          <Field label="Public holiday OT hours / month (3x)"><input className="input" type="number" value={otHoliday} onChange={(e) => setOtHoliday(+e.target.value || 0)} /></Field>
          <p className="text-xs text-muted-foreground">Hourly rate: <span className="text-foreground">{fmt(r.hourly)}</span></p>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="text-xs uppercase tracking-[0.2em] text-primary">Net take-home / month</div>
          <div className="mt-2 text-5xl font-bold text-gradient">{fmt(r.net)}</div>
          <div className="mt-6 space-y-3 text-sm">
            <Row label="Gross (salary + OT)" value={r.grossMonthly} />
            <Row label="Weekday OT @ 1.5x" value={r.otWd} muted />
            <Row label="Rest-day OT @ 2x" value={r.otRd} muted />
            <Row label="Holiday OT @ 3x" value={r.otHd} muted />
            <Row label="SSO (5%, cap ฿875)" value={-r.sso} />
            <Row label="Income tax (monthly)" value={-r.monthlyTax} />
          </div>
          <p className="mt-6 text-xs text-muted-foreground">Annual income tax: {fmt(r.annualTax)}. Tax assumes ฿60k personal + ฿100k expense allowance. Add insurance, RMF/SSF, etc. for accuracy.</p>
        </div>
      </div>
      <style>{`.input{width:100%;background:var(--color-input);border:1px solid var(--color-border);border-radius:.75rem;padding:.75rem 1rem;color:var(--color-foreground);outline:none}.input:focus{border-color:var(--color-primary)}`}</style>
    </PageShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</span><div className="mt-2">{children}</div></label>;
}
function Row({ label, value, muted }: { label: string; value: number; muted?: boolean }) {
  return (
    <div className={`flex items-center justify-between border-b border-border/40 pb-2 ${muted ? "opacity-70 pl-3 text-xs" : ""}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className={value < 0 ? "text-destructive font-semibold" : "font-semibold"}>{fmt(value)}</span>
    </div>
  );
}
