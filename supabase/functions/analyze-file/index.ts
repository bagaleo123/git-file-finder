// Analyses uploaded case files (PDF/image/text) with Lovable AI Gemini and stores extracted summary.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const { fileId, mime, base64, filename, lang } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SB_URL = Deno.env.get("SUPABASE_URL")!;
    const SB_SR = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const langName = lang === "th" ? "Thai" : lang === "ru" ? "Russian" : "English";

    const userParts: any[] = [
      {
        type: "text",
        text: `You are a Thai labor-law document analyst. The user uploaded "${filename}" to their case file.\n\nExtract every relevant fact in plain ${langName}:\n- Document type (employment contract, payslip, termination letter, work permit, visa, warning letter, etc.)\n- Parties involved (employer, employee names if present)\n- Salary, allowances, working hours, probation period\n- Notice period, termination clauses\n- Any clauses that VIOLATE Thai Labor Protection Act 2541 (e.g. waiver of severance, holding passport, illegal probation, no sick leave)\n- Dates, deadlines, signatures\n- Anything missing that should legally be there\n\nReturn a CONCISE structured summary in ${langName} with markdown headings. Be precise. Do NOT invent facts. If text is unreadable, say so.`,
      },
    ];

    if (mime?.startsWith("image/") || mime === "application/pdf") {
      userParts.push({ type: "image_url", image_url: { url: `data:${mime};base64,${base64}` } });
    } else {
      // text-like
      try {
        const text = atob(base64);
        userParts[0].text += `\n\nDOCUMENT TEXT:\n${text.slice(0, 30000)}`;
      } catch { /* ignore */ }
    }

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: userParts }],
      }),
    });

    if (!r.ok) {
      const t = await r.text();
      console.error("ai err", r.status, t);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const j = await r.json();
    const extracted = j.choices?.[0]?.message?.content ?? "";

    if (fileId) {
      const sb = createClient(SB_URL, SB_SR);
      await sb.from("case_files").update({ extracted_text: extracted }).eq("id", fileId);
    }

    return new Response(JSON.stringify({ extracted_text: extracted }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "err" }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
