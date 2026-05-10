// Contract scanner — analyze Thai employment contract text against labor law
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `You are a Thai labor-law contract auditor. Analyze the employment contract text and return findings strictly in JSON via the provided tool. Be aggressive in flagging anything that violates the Thai Labor Protection Act 2541 (and updates through 2026):
- waiver of severance, sick leave, notice
- "termination at will" / "no severance" / "30-day probation termination without pay" past 120 days
- illegal salary deductions
- non-compete clauses without compensation
- forfeited deposit / passport-holding clauses
- overtime cap below statutory minimum
- requiring annual leave to cover sick leave
- jurisdiction abroad (Thai labor court has exclusive jurisdiction)
- forced arbitration in another country`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "Missing 'text'" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: `Analyze this contract:\n\n${text.slice(0, 30000)}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "report_findings",
            description: "Return contract analysis findings",
            parameters: {
              type: "object",
              properties: {
                overall_risk: { type: "string", enum: ["low", "medium", "high", "critical"] },
                summary: { type: "string", description: "2-3 sentence plain English summary" },
                issues: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      severity: { type: "string", enum: ["info", "warning", "violation", "critical"] },
                      title: { type: "string" },
                      clause_excerpt: { type: "string", description: "Quote from the contract" },
                      law_reference: { type: "string", description: "Which Thai labor law it violates" },
                      recommendation: { type: "string", description: "What the worker should do" },
                    },
                    required: ["severity", "title", "clause_excerpt", "law_reference", "recommendation"],
                  },
                },
                missing_protections: { type: "array", items: { type: "string" } },
              },
              required: ["overall_risk", "summary", "issues", "missing_protections"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "report_findings" } },
      }),
    });

    if (!r.ok) {
      if (r.status === 429) return new Response(JSON.stringify({ error: "Rate limit hit." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (r.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await r.text(); console.error("AI error:", r.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await r.json();
    const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) {
      return new Response(JSON.stringify({ error: "No analysis returned" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(args, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
