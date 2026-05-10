import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { MapPin, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/justice-map")({
  head: () => ({ meta: [{ title: "Justice Map — DLPW Offices in Thailand" }] }),
  component: JusticeMap,
});

const OFFICES = [
  { city: "Bangkok", name: "DLPW Bangkok HQ", addr: "Mitmaitri Rd., Din Daeng, Bangkok 10400", phone: "+66 2 245 4310", maps: "https://maps.google.com/?q=Department+of+Labour+Protection+Welfare+Bangkok" },
  { city: "Phuket", name: "DLPW Phuket Provincial Office", addr: "38/19 Rattanakosin 200 Pi Rd., Talat Yai, Phuket 83000", phone: "+66 76 219 660", maps: "https://maps.google.com/?q=DLPW+Phuket" },
  { city: "Pattaya / Chonburi", name: "DLPW Chonburi", addr: "Sukhumvit Rd., Saen Suk, Mueang Chonburi 20130", phone: "+66 38 398 057", maps: "https://maps.google.com/?q=DLPW+Chonburi" },
  { city: "Chiang Mai", name: "DLPW Chiang Mai", addr: "Chotana Rd., Chang Phueak, Mueang Chiang Mai 50300", phone: "+66 53 112 622", maps: "https://maps.google.com/?q=DLPW+Chiang+Mai" },
  { city: "Koh Samui / Surat Thani", name: "DLPW Surat Thani", addr: "Don Nok Rd., Talad, Mueang Surat Thani 84000", phone: "+66 77 285 421", maps: "https://maps.google.com/?q=DLPW+Surat+Thani" },
  { city: "Hua Hin / Prachuap", name: "DLPW Prachuap Khiri Khan", addr: "Salachip Rd., Mueang Prachuap Khiri Khan 77000", phone: "+66 32 611 951", maps: "https://maps.google.com/?q=DLPW+Prachuap+Khiri+Khan" },
];

const CHECKLIST = [
  "Passport + work permit (originals + copies)",
  "Signed employment contract",
  "Last 3 months of pay slips & bank statements",
  "Termination letter / chat screenshots",
  "Form Kor.Sor.7 (provided at office, free)",
  "Translator if you're not confident in Thai (most offices have English staff)",
];

function JusticeMap() {
  return (
    <PageShell eyebrow="Tool · Justice Map" title="DLPW Offices Across Thailand" description="Where to physically file your labor complaint. Filing is free of charge.">
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <div className="grid sm:grid-cols-2 gap-4">
          {OFFICES.map((o) => (
            <a key={o.name} href={o.maps} target="_blank" rel="noreferrer" className="glass rounded-2xl p-5 hover:border-primary/60 transition group">
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-lg bg-gradient-shield grid place-items-center"><MapPin className="h-5 w-5 text-primary-foreground" /></div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </div>
              <div className="mt-4">
                <div className="text-[10px] uppercase tracking-[0.18em] text-primary">{o.city}</div>
                <div className="font-semibold mt-1">{o.name}</div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{o.addr}</p>
                <p className="mt-2 text-xs"><a href={`tel:${o.phone.replace(/\s/g, "")}`} className="text-primary hover:underline">{o.phone}</a></p>
              </div>
            </a>
          ))}
        </div>

        <aside className="glass rounded-2xl p-6 h-fit sticky top-24">
          <h3 className="text-sm uppercase tracking-[0.18em] text-primary font-semibold">Filing Checklist</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {CHECKLIST.map((c) => (
              <li key={c} className="flex gap-3">
                <span className="h-5 w-5 rounded-md bg-primary/15 text-primary grid place-items-center shrink-0 text-[10px]">✓</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-muted-foreground">DLPW conciliators decide most cases within 60 days. If unresolved, your case escalates to the Labour Court at no fee.</p>
        </aside>
      </div>
    </PageShell>
  );
}
