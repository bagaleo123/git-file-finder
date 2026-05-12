import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield, Mail, Lock, User as UserIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account — The Labor Shield Thailand" },
      { name: "description", content: "Create your free secure case room. Upload documents, build your case, and get tailored AI guidance on Thai labor law." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) nav({ to: "/cases" }); }, [user, nav]);

  async function emailSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: window.location.origin + "/cases",
        data: { full_name: name },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created — welcome!");
    nav({ to: "/cases" });
  }

  async function googleSignup() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/cases" });
    if (r.error) toast.error("Google sign-in failed");
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 py-10">
      <div className="w-full max-w-md glass rounded-2xl p-8">
        <Link to="/" className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-shield grid place-items-center glow"><Shield className="h-5 w-5 text-primary-foreground" /></div>
          <div className="text-sm font-semibold">The Labor Shield</div>
        </Link>
        <h1 className="text-2xl font-bold">Create your free case room</h1>
        <p className="text-sm text-muted-foreground mt-1">100% free. End-to-end private. No spam.</p>

        <button onClick={googleSignup} className="mt-6 w-full h-11 rounded-xl bg-surface border border-border/60 hover:border-primary/60 transition flex items-center justify-center gap-2 text-sm font-medium">
          <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.5 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.22-4.74 3.22-8.07z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.67-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.85 14.12c-.22-.67-.35-1.38-.35-2.12s.13-1.45.35-2.12V7.04H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.96l3.67-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.07.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.04l3.67 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
          Sign up with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-[11px] text-muted-foreground"><div className="flex-1 h-px bg-border" /> OR <div className="flex-1 h-px bg-border" /></div>

        <form onSubmit={emailSignup} className="space-y-3">
          <label className="block">
            <span className="text-xs text-muted-foreground">Name</span>
            <div className="mt-1 flex items-center gap-2 bg-surface/60 border border-border/60 rounded-xl px-3">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <input required value={name} onChange={(e) => setName(e.target.value)} className="flex-1 bg-transparent py-3 text-sm outline-none" placeholder="Your name" />
            </div>
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">Email</span>
            <div className="mt-1 flex items-center gap-2 bg-surface/60 border border-border/60 rounded-xl px-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 bg-transparent py-3 text-sm outline-none" placeholder="you@email.com" />
            </div>
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">Password (8+ characters)</span>
            <div className="mt-1 flex items-center gap-2 bg-surface/60 border border-border/60 rounded-xl px-3">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="flex-1 bg-transparent py-3 text-sm outline-none" placeholder="••••••••" />
            </div>
          </label>
          <button disabled={loading} className="w-full h-11 rounded-xl bg-gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Create Account
          </button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-5">Already a member? <Link to="/login" className="text-primary font-medium">Sign in</Link></p>
      </div>
    </div>
  );
}
