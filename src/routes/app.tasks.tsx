import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/app/tasks")({ component: TasksPage });

const SEED = [
  { id: 1, t: "Verify hospital admission for WOS-101", project: "WOS-101", due: "Today", done: false },
  { id: 2, t: "Collect bills from Mardan Medical Complex", project: "WOS-103", due: "Tomorrow", done: false },
  { id: 3, t: "Match O- donor for emergency request", project: "WOS-102", due: "Today", done: true },
  { id: 4, t: "Distribute relief packs · batch 3", project: "WOS-104", due: "Fri", done: false },
  { id: 5, t: "Upload donor proof receipts", project: "WOS-101", due: "Mon", done: false },
];

function TasksPage() {
  const [tasks, setTasks] = useState(SEED);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
        <p className="text-sm text-muted-foreground">{tasks.filter((t) => !t.done).length} open tasks</p>
      </div>
      <div className="bg-gradient-card rounded-2xl border border-border p-2 shadow-soft">
        {tasks.map((t) => (
          <label key={t.id} className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-muted/40">
            <Checkbox checked={t.done} onCheckedChange={(v) => setTasks((arr) => arr.map((x) => x.id === t.id ? { ...x, done: !!v } : x))} />
            <div className="flex-1">
              <div className={`text-sm ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.t}</div>
              <div className="text-[11px] text-muted-foreground">{t.project} · due {t.due}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
