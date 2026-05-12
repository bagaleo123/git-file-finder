import { AlertTriangle } from "lucide-react";

export function AIDisclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="text-[11px] text-muted-foreground/80 leading-relaxed border-t border-border/40 px-4 py-2 bg-warning/5">
        <AlertTriangle className="h-3 w-3 inline -mt-0.5 mr-1 text-warning" />
        AI legal consultant — not a licensed lawyer. For study & guidance only. We accept no liability for individual cases.
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-warning/40 bg-warning/5 p-4 flex gap-3 text-sm">
      <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
      <div className="leading-relaxed">
        <span className="font-semibold text-warning">AI Legal Consultant — Disclaimer.</span>{" "}
        This assistant is an AI tool, not a licensed attorney. Information is based on the latest publicly available
        sources on Thai labor & immigration law (2026 edition) and is provided for educational and case-study purposes
        only. The Labor Shield accepts no responsibility or liability for any decision, action, or outcome based on
        these answers. For binding advice, always consult a Thai-licensed lawyer or contact the Department of Labor
        Protection & Welfare (DLPW).
      </div>
    </div>
  );
}
