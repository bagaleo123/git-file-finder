import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { ChatPanel } from "@/components/chat-panel";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Legal Assistant — Thai Labor Law Chat" },
      { name: "description", content: "Free AI assistant trained on the Thai Labor Protection Act. Ask anything about your job, contract, sick pay, or how to file a complaint." },
    ],
  }),
  component: ChatRoute,
});

function ChatRoute() {
  return (
    <PageShell
      eyebrow="AI · Legal Assistant"
      title="Talk to Labor Shield AI"
      description="Trained on the Thai Labor Protection Act B.E. 2541 (2026 update). Ask anything — get plain-English, actionable answers."
    >
      <ChatPanel />
    </PageShell>
  );
}
