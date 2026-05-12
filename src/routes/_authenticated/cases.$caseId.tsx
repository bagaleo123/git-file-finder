import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Send, Sparkles, Loader2, Paperclip, FileText, Trash2, Download } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { AIDisclaimer } from "@/components/ai-disclaimer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/cases/$caseId")({
  head: () => ({ meta: [{ title: "Case Details — The Labor Shield" }] }),
  component: CaseDetail,
});

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-legal-chat`;
const ANALYZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-file`;

type Msg = { role: "user" | "assistant" | "system"; content: string };
type FileRow = { id: string; storage_path: string; filename: string; mime_type: string | null; size_bytes: number | null; extracted_text: string | null; created_at: string };

function CaseDetail() {
  const { caseId } = Route.useParams();
  const { user } = useAuth();
  const [caseInfo, setCaseInfo] = useState<{ title: string; employer_name: string | null; summary: string | null } | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [files, setFiles] = useState<FileRow[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    (async () => {
      const [{ data: c }, { data: m }, { data: f }] = await Promise.all([
        supabase.from("cases").select("title,employer_name,summary").eq("id", caseId).single(),
        supabase.from("case_messages").select("role,content").eq("case_id", caseId).order("created_at"),
        supabase.from("case_files").select("*").eq("case_id", caseId).order("created_at", { ascending: false }),
      ]);
      if (c) setCaseInfo(c);
      if (m) setMessages(m as Msg[]);
      if (f) setFiles(f);
    })();
  }, [caseId]);

  async function uploadFile(file: File) {
    if (!user) return;
    if (file.size > 15 * 1024 * 1024) return toast.error("Max 15 MB per file");
    setUploading(true);
    const path = `${user.id}/${caseId}/${Date.now()}_${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error: upErr } = await supabase.storage.from("case-files").upload(path, file);
    if (upErr) { setUploading(false); return toast.error(upErr.message); }

    const { data: row, error: insErr } = await supabase.from("case_files").insert({
      case_id: caseId, user_id: user.id, storage_path: path, filename: file.name, mime_type: file.type, size_bytes: file.size,
    }).select().single();
    if (insErr || !row) { setUploading(false); return toast.error(insErr?.message ?? "Insert failed"); }

    setFiles((arr) => [row as FileRow, ...arr]);
    toast.success("Uploaded — analysing…");

    // Analyse with AI
    try {
      const buf = await file.arrayBuffer();
      const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      const resp = await fetch(ANALYZE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ fileId: row.id, mime: file.type, base64: b64, filename: file.name }),
      });
      const j = await resp.json();
      if (j.extracted_text) {
        setFiles((arr) => arr.map((x) => x.id === row.id ? { ...x, extracted_text: j.extracted_text } : x));
        toast.success("AI analysed your document");
      }
    } catch { toast.error("Analysis failed — file is still saved"); }
    setUploading(false);
  }

  async function deleteFile(f: FileRow) {
    if (!confirm("Remove this file?")) return;
    await supabase.storage.from("case-files").remove([f.storage_path]);
    await supabase.from("case_files").delete().eq("id", f.id);
    setFiles((arr) => arr.filter((x) => x.id !== f.id));
  }

  async function downloadFile(f: FileRow) {
    const { data, error } = await supabase.storage.from("case-files").createSignedUrl(f.storage_path, 60);
    if (error) return toast.error(error.message);
    window.open(data.signedUrl, "_blank");
  }

  async function send(text: string) {
    if (!text.trim() || loading || !user) return;
    const userMsg: Msg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    await supabase.from("case_messages").insert({ case_id: caseId, user_id: user.id, role: "user", content: text });

    // Build context: case info + extracted text from files
    const fileCtx = files.filter((f) => f.extracted_text).map((f) => `--- FILE: ${f.filename} ---\n${f.extracted_text}`).join("\n\n");
    const contextMsg: Msg = {
      role: "system",
      content: `CASE FILE\nTitle: ${caseInfo?.title ?? ""}\nEmployer: ${caseInfo?.employer_name ?? "N/A"}\nUser summary: ${caseInfo?.summary ?? "N/A"}\n\nUPLOADED DOCUMENTS:\n${fileCtx || "(none)"}`,
    };

    let acc = "";
    const upsert = (chunk: string) => {
      acc += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: acc } : m));
        return [...prev, { role: "assistant", content: acc }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [contextMsg, ...next] }),
      });
      if (!resp.ok || !resp.body) {
        if (resp.status === 429) throw new Error("Rate limit. Wait and try again.");
        if (resp.status === 402) throw new Error("AI credits exhausted.");
        throw new Error("Assistant unreachable.");
      }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = ""; let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx); buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try { const p = JSON.parse(json); const c = p.choices?.[0]?.delta?.content; if (c) upsert(c); }
          catch { buffer = line + "\n" + buffer; break; }
        }
      }
      if (acc) await supabase.from("case_messages").insert({ case_id: caseId, user_id: user.id, role: "assistant", content: acc });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally { setLoading(false); }
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <Link to="/cases" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-4 w-4" /> All cases</Link>
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-primary">Case</div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold">{caseInfo?.title ?? "Loading…"}</h1>
          {caseInfo?.employer_name && <div className="text-sm text-muted-foreground">vs. {caseInfo.employer_name}</div>}
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          {/* CHAT */}
          <div className="glass rounded-2xl flex flex-col h-[72vh] min-h-[560px] overflow-hidden">
            <div className="px-5 py-3 border-b border-border/60 flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-gradient-shield grid place-items-center"><Sparkles className="h-4 w-4 text-primary-foreground" /></div>
              <div>
                <div className="text-sm font-semibold">Labor Shield AI · case mode</div>
                <div className="text-[11px] text-muted-foreground">Reads your uploaded documents to give specific advice</div>
              </div>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-5 py-5 space-y-4">
              {messages.length === 0 && (
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>Start by uploading your contract, payslips, or any letter from your employer (right panel). Then ask things like:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>"What's wrong with my contract?"</li>
                    <li>"How much severance am I owed?"</li>
                    <li>"Write a demand letter to my employer."</li>
                  </ul>
                </div>
              )}
              {messages.filter((m) => m.role !== "system").map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div className={m.role === "user"
                    ? "max-w-[85%] rounded-2xl rounded-br-sm bg-gradient-primary text-primary-foreground px-4 py-3 text-sm"
                    : "max-w-[90%] rounded-2xl rounded-bl-sm bg-surface/80 border border-border/60 px-4 py-3 text-sm prose prose-invert prose-sm max-w-none prose-p:my-2 prose-headings:mt-3 prose-headings:mb-1"}>
                    {m.role === "user" ? m.content : <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>}
                  </div>
                </div>
              ))}
              {loading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Analysing…</div>
              )}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="border-t border-border/60 p-3 flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about your case…" className="flex-1 bg-surface/60 border border-border/60 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60" disabled={loading} />
              <button type="submit" disabled={loading || !input.trim()} className="h-12 w-12 grid place-items-center rounded-xl bg-gradient-primary text-primary-foreground disabled:opacity-50"><Send className="h-4 w-4" /></button>
            </form>
            <AIDisclaimer compact />
          </div>

          {/* FILES */}
          <aside className="glass rounded-2xl p-5 h-fit">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="text-sm font-semibold flex items-center gap-2"><Paperclip className="h-4 w-4 text-primary" /> Case files</div>
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="text-xs px-3 py-1.5 rounded-lg bg-gradient-primary text-primary-foreground font-medium inline-flex items-center gap-1">
                {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Paperclip className="h-3 w-3" />} Upload
              </button>
              <input ref={fileInputRef} type="file" hidden accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.doc,.docx" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ""; }} />
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">PDF, image, or text. Max 15 MB. The AI reads them to advise on your case.</p>
            {files.length === 0 ? (
              <div className="text-xs text-muted-foreground py-6 text-center">No files yet</div>
            ) : (
              <ul className="space-y-2">
                {files.map((f) => (
                  <li key={f.id} className="bg-surface/60 border border-border/60 rounded-lg p-3 text-xs">
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{f.filename}</div>
                        <div className="text-muted-foreground mt-0.5">{f.size_bytes ? `${Math.round(f.size_bytes / 1024)} KB` : ""}{f.extracted_text ? " · ✓ analysed" : " · queued"}</div>
                      </div>
                      <button onClick={() => downloadFile(f)} className="p-1 text-muted-foreground hover:text-foreground"><Download className="h-3.5 w-3.5" /></button>
                      <button onClick={() => deleteFile(f)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
