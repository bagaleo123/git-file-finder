import { Coffee, Heart } from "lucide-react";

// Replace these with your real handles in one place:
const BMC_USERNAME = "laborshield"; // https://www.buymeacoffee.com/<username>
const PAYPAL_ME = "laborshield"; // https://paypal.me/<handle>

export function DonateInline() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={`https://www.buymeacoffee.com/${BMC_USERNAME}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-warning/15 text-warning hover:bg-warning/25 transition"
      >
        <Coffee className="h-3.5 w-3.5" /> Buy me a coffee
      </a>
      <a
        href={`https://paypal.me/${PAYPAL_ME}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/15 text-primary hover:bg-primary/25 transition"
      >
        <Heart className="h-3.5 w-3.5" /> Donate via PayPal
      </a>
    </div>
  );
}

export function DonateBanner() {
  return (
    <div className="glass rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="text-sm font-semibold">This tool is free for everyone in Thailand 🇹🇭</div>
        <div className="text-xs text-muted-foreground mt-1">If it helped you, a small tip keeps the AI online for the next person.</div>
      </div>
      <DonateInline />
    </div>
  );
}
