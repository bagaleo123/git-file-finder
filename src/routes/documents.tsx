import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/page-shell";
import { Copy, Download, FileText, Check } from "lucide-react";

export const Route = createFileRoute("/documents")({
  head: () => ({ meta: [{ title: "Document Generator — Demand Letters EN/TH" }] }),
  component: Documents,
});

const TEMPLATES = {
  severance: {
    label: "Severance demand",
    en: (d: Data) => `Date: ${d.date}

To: ${d.employer}
From: ${d.name}, Passport ${d.passport}
Re: Demand for unpaid severance and statutory entitlements

Dear Sir/Madam,

I was employed by ${d.employer} from ${d.start} to ${d.end} as ${d.position}, with a monthly salary of ฿${d.salary}.

Pursuant to Section 118 of the Thai Labour Protection Act B.E. 2541, I am entitled to severance pay equivalent to ${d.severanceDays} days of wages, totalling ฿${d.severanceAmount}, plus one (1) month notice pay in lieu of ฿${d.salary}.

I formally demand payment of the total amount of ฿${d.total} within fifteen (15) days of receipt of this letter, failing which I will file a complaint with the Department of Labour Protection and Welfare and pursue all available legal remedies.

Sincerely,
${d.name}`,
    th: (d: Data) => `วันที่: ${d.date}

เรียน ฝ่ายบุคคล ${d.employer}
จาก: ${d.name} หนังสือเดินทางเลขที่ ${d.passport}
เรื่อง: ทวงถามค่าชดเชยและสิทธิตามกฎหมายแรงงาน

ข้าพเจ้าเป็นพนักงานของ ${d.employer} ตั้งแต่ ${d.start} ถึง ${d.end} ในตำแหน่ง ${d.position} เงินเดือน ${d.salary} บาท

ตามมาตรา 118 แห่งพระราชบัญญัติคุ้มครองแรงงาน พ.ศ. 2541 ข้าพเจ้ามีสิทธิได้รับค่าชดเชยเท่ากับค่าจ้าง ${d.severanceDays} วัน รวมเป็นเงิน ${d.severanceAmount} บาท พร้อมค่าบอกกล่าวล่วงหน้า 1 เดือน เป็นเงิน ${d.salary} บาท

ข้าพเจ้าขอทวงถามยอดรวมจำนวน ${d.total} บาท ภายใน 15 วัน นับแต่ได้รับหนังสือนี้ มิฉะนั้น ข้าพเจ้าจะดำเนินการร้องเรียนต่อกรมสวัสดิการและคุ้มครองแรงงานและดำเนินคดีตามกฎหมาย

ขอแสดงความนับถือ
${d.name}`,
  },
};

type Data = {
  date: string; employer: string; name: string; passport: string;
  start: string; end: string; position: string; salary: string;
  severanceDays: string; severanceAmount: string; total: string;
};

function Documents() {
  const [d, setD] = useState<Data>({
    date: new Date().toISOString().slice(0, 10),
    employer: "ABC Co., Ltd.",
    name: "John Smith",
    passport: "X1234567",
    start: "2022-01-15",
    end: "2026-03-31",
    position: "Senior Developer",
    salary: "60,000",
    severanceDays: "180",
    severanceAmount: "360,000",
    total: "420,000",
  });
  const [tab, setTab] = useState<"en" | "th">("en");
  const [copied, setCopied] = useState(false);

  const text = TEMPLATES.severance[tab](d);

  const copy = async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const download = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `demand-letter-${tab}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const set = (k: keyof Data) => (e: React.ChangeEvent<HTMLInputElement>) => setD({ ...d, [k]: e.target.value });

  return (
    <PageShell eyebrow="Tool · Documents" title="Bilingual Demand Letters" description="Generate formal severance-demand letters in English and Legal Thai. Print, sign, and send registered mail.">
      <div className="grid lg:grid-cols-[1fr_1.3fr] gap-6">
        <div className="glass rounded-2xl p-6 space-y-3">
          {(["date","employer","name","passport","start","end","position","salary","severanceDays","severanceAmount","total"] as const).map((k) => (
            <label key={k} className="block">
              <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{k}</span>
              <input value={d[k]} onChange={set(k)} className="mt-1 w-full bg-input border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
            </label>
          ))}
        </div>

        <div className="glass rounded-2xl overflow-hidden flex flex-col">
          <div className="border-b border-border/60 px-4 py-3 flex items-center justify-between">
            <div className="flex gap-1">
              {(["en","th"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 text-xs uppercase tracking-[0.15em] rounded-md ${tab===t?"bg-primary text-primary-foreground":"text-muted-foreground hover:text-foreground"}`}>
                  {t === "en" ? "English" : "ภาษาไทย"}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={copy} className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-surface hover:bg-surface/60">
                {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />} {copied ? "Copied" : "Copy"}
              </button>
              <button onClick={download} className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-surface hover:bg-surface/60">
                <Download className="h-3 w-3" /> .txt
              </button>
            </div>
          </div>
          <pre className="flex-1 p-6 text-sm whitespace-pre-wrap font-mono leading-relaxed overflow-auto">{text}</pre>
          <div className="border-t border-border/60 px-4 py-3 text-xs text-muted-foreground flex items-center gap-2">
            <FileText className="h-3 w-3" /> Send via Thailand Post EMS for trackable proof of delivery.
          </div>
        </div>
      </div>
    </PageShell>
  );
}
