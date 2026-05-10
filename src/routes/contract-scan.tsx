import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/page-shell";
import { Upload, FileSearch, Loader2, AlertTriangle, AlertCircle, Info, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/contract-scan")({
  head: () => ({
    meta: [
      { title: "Contract Scanner — AI Thai Labor Law Audit" },
      { name: "description", content: "Upload or paste your Thai employment contract. Our AI flags illegal clauses, missing protections, and red flags instantly." },
    ],
  }),
  component: ContractScan,
});

type Issue = {
  severity: "info" | "warning" | "violation" | "critical";
  title: string;
  clause_excerpt: string;
  law_reference: string;
  recommendation: string;
};
type Result = {
  overall_risk: "low" | "medium" | "high" | "critical";
  summary: string;
  issues: Issue[];
  missing_protections: string[];
};

const SCAN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scan-contract`;

function ContractScan() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleFile(f: File) {
    setFileName(f.name);
    if (f.type === "text/plain" || f.name.endsWith(".txt") || f.name.endsWith(".md")) {
      setText(await f.text());
      return;
    }
    // Fallback: just read as text — for PDFs we tell user to paste
    try {
      const t = await f.text();
      if (t && t.trim().length > 50) setText(t);
      else setError("PDF detected — please copy/paste the contract text into the box below for now.");
    } catch {
      setError("Couldn't read this file. Please paste the contract text directly.");
    }
  }

  async function scan() {
    if (text.trim().length < 50) { setError("Please paste at least a paragraph of contract text."); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const r = await fetch(SCAN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Scan failed");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed");
    } finally { setLoading(false); }
  }

  return (
    <PageShell
      eyebrow="Tool · Contract Scanner"
      title="AI Contract Audit"
      description="Drop a file or paste your employment contract. Our AI cross-references every clause against the Thai Labor Protection Act."
    >
      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6">
        <div className="glass rounded-2xl p-6">
          <label className="block">
            <input
              type="file"
              accept=".txt,.md,.pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              id="cv-file"
            />
            <div className="cursor-pointer rounded-xl border-2 border-dashed border-border hover:border-primary/60 px-6 py-10 text-center transition" onClick={() => document.getElementById("cv-file")?.click()}>
              <Upload className="h-8 w-8 mx-auto text-primary" />
              <div className="mt-3 font-semibold">{fileName ?? "Upload contract / CV"}</div>
              <div className="mt-1 text-xs text-muted-foreground">.txt, .md, .pdf, .doc — or paste below</div>
            </div>
          </label>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste contract text here…"
            className="mt-4 w-full h-64 bg-input border border-border rounded-xl p-4 text-sm font-mono outline-none focus:border-primary"
          />

          <button
            onClick={scan}
            disabled={loading || text.trim().length < 50}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-primary text-primary-foreground font-semibold glow disabled:opacity-50"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing…</> : <><FileSearch className="h-4 w-4" /> Scan Contract</>}
          </button>

          {error && <div className="mt-3 text-sm text-destructive">{error}</div>}
        </div>

        <div className="glass rounded-2xl p-6 min-h-[400px]">
          {!result && !loading && (
            <div className="h-full grid place-items-center text-center text-muted-foreground">
              <div>
                <ShieldCheck className="h-10 w-10 mx-auto text-primary opacity-60" />
                <p className="mt-3 text-sm">Results will appear here. Every clause is checked against Thai labor law.</p>
              </div>
            </div>
          )}
          {loading && (
            <div className="h-full grid place-items-center text-muted-foreground">
              <div className="text-center">
                <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                <p className="mt-3 text-sm">Auditing your contract…</p>
              </div>
            </div>
          )}
          {result && <ResultView r={result} />}
        </div>
      </div>
    </PageShell>
  );
}

function ResultView({ r }: { r: Result }) {
  const riskColor: Record<string, string> = {
    low: "text-success bg-success/10 border-success/30",
    medium: "text-warning bg-warning/10 border-warning/30",
    high: "text-destructive bg-destructive/10 border-destructive/30",
    critical: "text-destructive bg-destructive/15 border-destructive/40",
  };
  return (
    <div className="space-y-5">
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs uppercase tracking-[0.15em] font-semibold ${riskColor[r.overall_risk]}`}>
        Risk: {r.overall_risk}
      </div>
      <p className="text-sm leading-relaxed">{r.summary}</p>

      {r.issues.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">Issues found ({r.issues.length})</h3>
          <div className="space-y-3">
            {r.issues.map((i, idx) => <IssueCard key={idx} issue={i} />)}
          </div>
        </div>
      )}

      {r.missing_protections.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">Missing protections</h3>
          <ul className="space-y-2 text-sm">
            {r.missing_protections.map((m, idx) => (
              <li key={idx} className="flex gap-2"><Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />{m}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function IssueCard({ issue }: { issue: Issue }) {
  const Icon = issue.severity === "critical" || issue.severity === "violation" ? AlertCircle : issue.severity === "warning" ? AlertTriangle : Info;
  const tone =
    issue.severity === "critical" ? "border-destructive/40 bg-destructive/5" :
    issue.severity === "violation" ? "border-destructive/30 bg-destructive/5" :
    issue.severity === "warning" ? "border-warning/30 bg-warning/5" : "border-border bg-surface/40";
  const iconTone =
    issue.severity === "critical" || issue.severity === "violation" ? "text-destructive" :
    issue.severity === "warning" ? "text-warning" : "text-primary";
  return (
    <div className={`rounded-xl border p-4 ${tone}`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 ${iconTone} shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">{issue.title}</h4>
            <span className={`text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 rounded ${iconTone} bg-current/10`}>{issue.severity}</span>
          </div>
          <blockquote className="mt-2 text-xs italic text-muted-foreground border-l-2 border-border pl-3">"{issue.clause_excerpt}"</blockquote>
          <p className="mt-2 text-xs"><span className="text-muted-foreground">Law: </span>{issue.law_reference}</p>
          <p className="mt-2 text-sm"><span className="font-medium text-primary">→ </span>{issue.recommendation}</p>
        </div>
      </div>
    </div>
  );
}
