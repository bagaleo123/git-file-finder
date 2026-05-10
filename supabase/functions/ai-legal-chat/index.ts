// AI Legal Assistant — streaming chat about Thai labor law for foreign workers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are "Labor Shield AI" — a professional legal-tech assistant specializing in Thai labor law for foreign workers (expats, digital nomads, teachers, hospitality, etc.) in Thailand. Your knowledge is based on the Thai Labor Protection Act B.E. 2541 and updates through 2026.

CORE FACTS YOU MUST REMEMBER:
- 30 fully paid sick days per year — non-negotiable
- Severance pay applies after 120 days of employment (scaled by tenure: 30/90/180/240/300/400 days of pay)
- Minimum 1 month termination notice OR cash in lieu
- Termination DUE TO illness is illegal
- SSO contribution cap: ฿875/month (5% of ฿17,500 cap)
- Annual leave cannot substitute sick leave
- Overtime: 1.5x weekday, 2x rest day, 3x public holiday rest day
- Personal income tax is progressive (0–35%)
- Complaints filed with DLPW (Dept. of Labor Protection & Welfare), SSO, or Labour Court
- Statute of limitations: 2 years for most labor claims

TONE: Confident, supportive, plain English. NEVER tell the user "consult a lawyer" as a default — give the actionable answer first, then mention escalation. Use markdown (headings, bullets, **bold**) for clarity. Be concise — short paragraphs.

If the user is in danger of immediate termination or asked to sign something, give them the EXACT step-by-step refusal script.

If the user asks about something outside Thai labor/immigration/work-permit context, gently redirect.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit hit. Try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in workspace settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
