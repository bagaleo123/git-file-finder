import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Briefcase, Loader2, LogOut, ArrowRight, Trash2 } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { AIDisclaimer } from "@/components/ai-disclaimer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/cases")({
  head: () => ({ meta: [{ title: "My Cases — The Labor Shield" }] }),
  component: CasesPage,
});

type Case = { id: string; title: string; summary: string | null; employer_name: string | null; status: string; created_at: string };

function CasesPage() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [employer, setEmployer] = useState("");
  const [summary, setSummary] = useState("");

  async function load() {
    const { data, error } = await supabase.from("cases").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message); else setCases(data ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setCreating(true);
    const { data, error } = await supabase.from("cases").insert({ user_id: user.id, title, employer_name: employer || null, summary: summary || null }).select().single();
    setCreating(false);
    if (error) return toast.error(error.message);
    toast.success("Case created");
    nav({ to: "/cases/$caseId", params: { caseId: data.id } });
  }

  async function remove(id: string) {
    if (!confirm("Delete this case and all its files?")) return;
    const { error } = await supabase.from("cases").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setCases((c) => c.filter((x) => x.id !== id));
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-primary">Personal Case Room</div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold">My Cases</h1>
            <p className="text-sm text-muted-foreground mt-2">Hi {user?.email} · your private workspace.</p>
          </div>
          <button onClick={() => signOut().then(() => nav({ to: "/" }))} className="text-xs px-3 py-2 rounded-lg bg-surface border border-border/60 hover:border-destructive/60 inline-flex items-center gap-2">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>

        <div className="mt-6"><AIDisclaimer /></div>

        <section className="mt-8 grid lg:grid-cols-[1fr_360px] gap-6">
          <div>
            <h2 className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-3">Open cases</h2>
            {loading ? (
              <div className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
            ) : cases.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
                <Briefcase className="h-8 w-8 mx-auto mb-3 text-primary" />
                No cases yet. Create your first case on the right →
              </div>
            ) : (
              <ul className="space-y-3">
                {cases.map((c) => (
                  <li key={c.id} className="glass rounded-2xl p-5 hover:border-primary/60 transition group">
                    <div className="flex justify-between gap-3">
                      <Link to="/cases/$caseId" params={{ caseId: c.id }} className="flex-1">
                        <div className="font-semibold">{c.title}</div>
                        {c.employer_name && <div className="text-xs text-muted-foreground mt-0.5">vs. {c.employer_name}</div>}
                        {c.summary && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{c.summary}</p>}
                        <div className="mt-3 inline-flex items-center gap-1 text-xs text-primary">Open case <ArrowRight className="h-3 w-3" /></div>
                      </Link>
                      <button onClick={() => remove(c.id)} className="text-muted-foreground hover:text-destructive p-1 h-fit"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside className="glass rounded-2xl p-5 h-fit sticky top-24">
            <div className="text-sm font-semibold flex items-center gap-2"><Plus className="h-4 w-4 text-primary" /> New case</div>
            <form onSubmit={create} className="mt-4 space-y-3">
              <input required placeholder="Case title (e.g. Wrongful termination)" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-surface/60 border border-border/60 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary/60" />
              <input placeholder="Employer name (optional)" value={employer} onChange={(e) => setEmployer(e.target.value)} className="w-full bg-surface/60 border border-border/60 rounded-lg px-3 py-2.5 text-sm outline-none" />
              <textarea placeholder="Briefly describe what happened…" value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} className="w-full bg-surface/60 border border-border/60 rounded-lg px-3 py-2.5 text-sm outline-none" />
              <button disabled={creating} className="w-full h-10 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2">
                {creating && <Loader2 className="h-4 w-4 animate-spin" />} Create case
              </button>
            </form>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
