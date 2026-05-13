import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { StatusBadge, UrgencyBadge } from "@/components/Badges";
import { Progress } from "@/components/ui/progress";
import { formatPKR, timeAgo } from "@/lib/format";
import { Search, LayoutGrid, Rows3, RefreshCw, Plus } from "lucide-react";
import { WINGS } from "@/lib/mock-data";

export const Route = createFileRoute("/app/projects")({
  component: ProjectsPage,
  validateSearch: (s: Record<string, unknown>) => ({
    q: (s.q as string) || "",
    status: (s.status as string) || "",
    urgency: (s.urgency as string) || "",
    type: (s.type as string) || "",
    wing: (s.wing as string) || "",
  }),
});

const TYPES = ["Medical Aid", "Blood Donation", "Financial Aid", "Welfare Campaign", "Community Support", "Emergency Patient"];
const STATUSES = ["Pending Review", "Verified", "Active", "In Progress", "Partially Funded", "Donor Matched", "Completed", "Closed", "Rejected"];
const URGENCIES = ["Low", "Medium", "High", "Critical"];

function ProjectsPage() {
  const { projects, projectsLoading, projectsError, refreshProjects, isSupabaseData } = useStore();
  const search = Route.useSearch();
  const [q, setQ] = useState(search.q || "");
  const [status, setStatus] = useState(search.status || "");
  const [urgency, setUrgency] = useState(search.urgency || "");
  const [type, setType] = useState(search.type || "");
  const [wing, setWing] = useState(search.wing || "");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => projects.filter((p) =>
    (!q || p.title.toLowerCase().includes(q.toLowerCase()) || p.id.toLowerCase().includes(q.toLowerCase()))
    && (!status || p.status === status)
    && (!urgency || p.urgency === urgency)
    && (!type || p.type === type)
    && (!wing || p.wing === wing)
  ), [projects, q, status, urgency, type, wing]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} of {projects.length} projects</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => void refreshProjects(true)} className="flex h-10 items-center gap-1 rounded-xl border border-border bg-card px-3 text-xs text-muted-foreground hover:text-foreground"><RefreshCw className={`h-3.5 w-3.5 ${projectsLoading ? "animate-spin" : ""}`} />Refresh Data</button>
          <Link to="/app/submit" className="flex h-10 items-center gap-1 rounded-xl bg-gradient-brand px-3 text-xs text-primary-foreground shadow-soft"><Plus className="h-3.5 w-3.5" />Create Project</Link>
          <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
          <button onClick={() => setView("grid")} className={`flex h-8 items-center gap-1 rounded-lg px-3 text-xs ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}><LayoutGrid className="h-3.5 w-3.5" />Grid</button>
          <button onClick={() => setView("list")} className={`flex h-8 items-center gap-1 rounded-lg px-3 text-xs ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}><Rows3 className="h-3.5 w-3.5" />List</button>
          </div>
        </div>
      </div>

      {isSupabaseData && <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs text-muted-foreground">Connected to Supabase projects. Realtime updates refresh this list automatically when permitted.</div>}

      {projectsError && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <div className="font-medium">Could not load projects from Supabase.</div>
          <div className="mt-1 text-destructive/80">{projectsError}</div>
          <button onClick={() => void refreshProjects(true)} className="mt-3 rounded-xl bg-destructive px-3 py-2 text-xs font-medium text-destructive-foreground">Retry</button>
        </div>
      )}

      <div className="bg-gradient-card flex flex-wrap items-center gap-2 rounded-2xl border border-border p-3 shadow-soft">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title or ID" className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-ring" />
        </div>
        <Select value={type} onChange={setType} options={["", ...TYPES]} placeholder="All types" />
        <Select value={status} onChange={setStatus} options={["", ...STATUSES]} placeholder="All statuses" />
        <Select value={urgency} onChange={setUrgency} options={["", ...URGENCIES]} placeholder="All urgencies" />
        <Select value={wing} onChange={setWing} options={["", ...WINGS]} placeholder="All wings" />
      </div>

      {projectsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-56 animate-pulse rounded-2xl border border-border bg-muted/40" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-gradient-card p-10 text-center shadow-soft">
          <div className="text-lg font-semibold">No projects found</div>
          <p className="mt-1 text-sm text-muted-foreground">Try clearing filters or submit a new project to bring the system alive.</p>
          <Link to="/app/submit" className="mt-4 inline-flex rounded-xl bg-gradient-brand px-4 py-2 text-sm text-primary-foreground">Submit Project</Link>
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => {
            const pct = p.target > 0 ? Math.min(100, (p.raised / p.target) * 100) : 0;
            return (
              <Link key={p.id} to="/app/projects/$id" params={{ id: p.id }} className="bg-gradient-card group rounded-2xl border border-border p-5 shadow-soft hover-lift">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{p.id} · {p.type}</div>
                    <div className="mt-1 line-clamp-2 font-medium">{p.title}</div>
                  </div>
                  <UrgencyBadge urgency={p.urgency} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge status={p.status} />
                  <span className="text-[11px] text-muted-foreground">· {p.wing}</span>
                </div>
                {p.target > 0 ? (
                  <>
                    <div className="mt-4 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Funds raised</span>
                      <span className="font-medium">{formatPKR(p.raised)} <span className="text-muted-foreground">/ {formatPKR(p.target)}</span></span>
                    </div>
                    <Progress value={pct} className="mt-2 h-2" />
                  </>
                ) : p.bloodGroup ? (
                  <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    Need {p.bloodGroup} · {p.unitsArranged ?? 0}/{p.unitsRequired} units arranged
                  </div>
                ) : null}
                <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Updated {timeAgo(p.updatedAt)}</span>
                  <span>{p.assignedMember}</span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-gradient-card overflow-hidden rounded-2xl border border-border shadow-soft">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">ID</th><th className="px-4 py-3">Title</th><th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th><th className="px-4 py-3">Urgency</th><th className="px-4 py-3">Funds</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{p.id}</td>
                  <td className="px-4 py-3"><Link to="/app/projects/$id" params={{ id: p.id }} className="font-medium hover:text-primary">{p.title}</Link></td>
                  <td className="px-4 py-3 text-muted-foreground">{p.type}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3"><UrgencyBadge urgency={p.urgency} /></td>
                  <td className="px-4 py-3">{p.target > 0 ? `${formatPKR(p.raised)} / ${formatPKR(p.target)}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Select({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: string[]; placeholder: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring">
      {options.map((o) => <option key={o || "__"} value={o}>{o || placeholder}</option>)}
    </select>
  );
}
