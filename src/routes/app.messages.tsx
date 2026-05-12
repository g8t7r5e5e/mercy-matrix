import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/format";

export const Route = createFileRoute("/app/messages")({ component: MessagesPage });

const CONVOS = [
  { id: "c1", name: "Medical Aid Wing", last: "Hospital confirmed admission.", unread: 2, time: "12m" },
  { id: "c2", name: "Blood Wing", last: "2 donors matched for WOS-102", unread: 1, time: "1h" },
  { id: "c3", name: "Finance Wing", last: "Receipts uploaded for WOS-101", unread: 0, time: "3h" },
  { id: "c4", name: "Volunteer Wing", last: "Distribution complete in Swat.", unread: 0, time: "1d" },
  { id: "c5", name: "Admin Broadcast", last: "Monthly impact report ready.", unread: 0, time: "2d" },
];

function MessagesPage() {
  const { user } = useStore();
  const [active, setActive] = useState(CONVOS[0]);
  const [thread, setThread] = useState<{ me: boolean; t: string; at: string }[]>([
    { me: false, t: "Hospital confirmed admission for WOS-101.", at: new Date(Date.now() - 1000 * 60 * 12).toISOString() },
    { me: false, t: "Documents collected, uploading now.", at: new Date(Date.now() - 1000 * 60 * 8).toISOString() },
    { me: true, t: "Great. Coordinate with Finance for next disbursement.", at: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  ]);
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    setThread((th) => [...th, { me: true, t: text, at: new Date().toISOString() }]);
    setText("");
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
      <div className="grid h-[600px] grid-cols-1 gap-0 overflow-hidden rounded-2xl border border-border bg-card shadow-soft md:grid-cols-[280px_1fr]">
        <aside className="border-b border-border md:border-b-0 md:border-r overflow-y-auto">
          {CONVOS.map((c) => (
            <button key={c.id} onClick={() => setActive(c)} className={`flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition hover:bg-muted/40 ${active.id === c.id ? "bg-muted/60" : ""}`}>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brand text-xs font-semibold text-primary-foreground">{c.name.split(" ").map((n) => n[0]).join("").slice(0,2)}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between text-sm font-medium"><span className="truncate">{c.name}</span><span className="text-[10px] text-muted-foreground">{c.time}</span></div>
                <div className="truncate text-xs text-muted-foreground">{c.last}</div>
              </div>
              {c.unread > 0 && <span className="rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground">{c.unread}</span>}
            </button>
          ))}
        </aside>
        <section className="flex flex-col">
          <div className="border-b border-border px-4 py-3 text-sm font-semibold">{active.name}</div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {thread.map((m, i) => (
              <div key={i} className={`flex ${m.me ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-soft ${m.me ? "bg-gradient-brand text-primary-foreground" : "bg-muted"}`}>
                  <div>{m.t}</div>
                  <div className={`mt-1 text-[10px] ${m.me ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{timeAgo(m.at)}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 border-t border-border p-3">
            <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={`Message ${active.name}...`} className="h-10 flex-1 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring" />
            <Button onClick={send} className="bg-gradient-brand"><Send className="h-4 w-4" /></Button>
          </div>
        </section>
      </div>
    </div>
  );
}
