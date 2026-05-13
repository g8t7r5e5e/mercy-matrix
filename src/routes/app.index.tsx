import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Counter } from "@/components/Counter";
import { StatusBadge, UrgencyBadge } from "@/components/Badges";
import { formatPKR, timeAgo } from "@/lib/format";
import {
  Heart, FolderKanban, Activity, CheckCircle2, HandCoins, BadgeCheck, Droplets, Users, UserPlus, AlertTriangle,
  TrendingUp, Plus, FileBarChart, ShieldCheck, ArrowUpRight,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

const monthly = [
  { m: "Jun", impact: 80, raised: 320000, disbursed: 280000 },
  { m: "Jul", impact: 110, raised: 480000, disbursed: 410000 },
  { m: "Aug", impact: 140, raised: 560000, disbursed: 520000 },
  { m: "Sep", impact: 170, raised: 720000, disbursed: 640000 },
  { m: "Oct", impact: 220, raised: 940000, disbursed: 880000 },
  { m: "Nov", impact: 280, raised: 1180000, disbursed: 1020000 },
  { m: "Dec", impact: 284, raised: 650000, disbursed: 580000 },
];
const wingPerf = [
  { w: "Medical", v: 38 },
  { w: "Blood", v: 22 },
  { w: "Finance", v: 17 },
  { w: "Volunteer", v: 14 },
  { w: "Student", v: 9 },
];

export default function Dashboard() {
  const { user, projects, activity, refreshProjects, projectsLoading, isSupabaseData } = useStore();

  const totalRaised = projects.reduce((s, p) => s + p.raised, 0);
  const disbursed = Math.floor(totalRaised * 0.78);
  const active = projects.filter((p) => ["Active", "In Progress", "Partially Funded", "Donor Matched"].includes(p.status)).length;
  const completed = projects.filter((p) => ["Completed", "Closed"].includes(p.status)).length;
  const pending = projects.filter((p) => p.status === "Pending Review").length;
  const bloodProjects = projects.filter((p) => p.type === "Blood Donation").length;
  const blood = projects.filter((p) => p.type === "Blood Donation").reduce((s, p) => s + (p.unitsArranged || 0), 0);
  const critical = projects.filter((p) => p.urgency === "Critical" || p.urgency === "High").length;
  const lives = projects.reduce((s, p) => s + (p.livesImpacted || (p.status === "Completed" || p.status === "Closed" ? 5 : 1)), 0);

  const typeData = ["Medical Aid", "Blood Donation", "Financial Aid", "Welfare Campaign", "Community Support", "Emergency Patient"].map((t) => ({
    name: t, value: projects.filter((p) => p.type === t).length,
  })).filter((x) => x.value > 0);
  const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--primary)"];

  const urgentCases = projects.filter((p) => p.urgency === "Critical" || p.status === "Pending Review").slice(0, 4);

  const kpis = [
    { icon: Heart, label: "Total Lives Impacted", value: lives, sub: "from connected projects", tone: "text-success" },
    { icon: FolderKanban, label: "Total Projects", value: projects.length, sub: "across all wings" },
    { icon: Activity, label: "Active Projects", value: active, sub: "currently running" },
    { icon: CheckCircle2, label: "Completed", value: completed, sub: "successfully closed", tone: "text-success" },
    { icon: HandCoins, label: "Funds Raised", value: totalRaised, prefix: "PKR ", sub: "from project records", tone: "text-success" },
    { icon: BadgeCheck, label: "Funds Disbursed", value: disbursed, prefix: "PKR ", sub: "to verified cases" },
    { icon: Droplets, label: "Blood Units", value: blood, sub: `${bloodProjects} blood projects`, tone: "text-destructive" },
    { icon: Users, label: "Critical/Urgent", value: critical, sub: "high priority projects", tone: "text-destructive" },
    { icon: UserPlus, label: "Active Donors", value: 142, sub: "future donation module" },
    { icon: AlertTriangle, label: "Pending Approvals", value: pending, sub: "awaiting review", tone: "text-warning" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {user?.name?.split(" ")[0]}</h1>
          <p className="text-sm text-muted-foreground">Here's what's happening across WelfareOS today.{isSupabaseData ? " Supabase project data is live." : " Demo fallback data is active."}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/app/submit"><Button className="bg-gradient-brand"><Plus className="mr-1 h-4 w-4" />New Project</Button></Link>
          <Link to="/app/blood"><Button variant="outline"><Droplets className="mr-1 h-4 w-4" />Blood Request</Button></Link>
          <Button variant="outline" onClick={() => void refreshProjects(true)} disabled={projectsLoading}>Refresh Data</Button>
          <Link to="/app/reports"><Button variant="outline"><FileBarChart className="mr-1 h-4 w-4" />Generate Report</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {kpis.map((k) => (
          <div key={k.label} className="hover-lift bg-gradient-card relative overflow-hidden rounded-2xl border border-border p-4 shadow-soft">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/5" />
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <k.icon className="h-4 w-4" />
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="mt-3 text-2xl font-semibold tracking-tight">
              <Counter value={k.value} prefix={k.prefix} />
            </div>
            <div className="text-xs text-muted-foreground">{k.label}</div>
            <div className={`mt-1 text-[11px] ${k.tone || "text-muted-foreground"}`}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="bg-gradient-card lg:col-span-2 rounded-2xl border border-border p-5 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Funds raised vs disbursed</div>
              <div className="text-xs text-muted-foreground">Last 7 months</div>
            </div>
            <div className="text-xs text-success flex items-center gap-1"><TrendingUp className="h-3 w-3" />+12.4%</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="raised" stroke="var(--primary)" fill="url(#g1)" strokeWidth={2} />
                <Area type="monotone" dataKey="disbursed" stroke="var(--accent)" fill="url(#g2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gradient-card rounded-2xl border border-border p-5 shadow-soft">
          <div className="mb-3 text-sm font-semibold">Projects by type</div>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={typeData} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px]">
            {typeData.map((t, i) => (
              <div key={t.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="truncate text-muted-foreground">{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="bg-gradient-card rounded-2xl border border-border p-5 shadow-soft">
          <div className="mb-3 text-sm font-semibold">Wing performance</div>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={wingPerf}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="w" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="v" fill="var(--primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gradient-card rounded-2xl border border-border p-5 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold">Live activity</div>
            <span className="inline-flex items-center gap-1 text-[11px] text-success">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> live
            </span>
          </div>
          <ul className="space-y-3">
            {activity.slice(0, 6).map((a) => (
              <li key={a.id} className="flex items-start gap-3 text-sm animate-slide-in-left">
                <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                  a.kind === "donation" ? "bg-success" : a.kind === "blood" ? "bg-destructive" : a.kind === "project" ? "bg-primary" : "bg-muted-foreground"
                }`} />
                <div className="min-w-0 flex-1">
                  <div className="truncate">{a.text}</div>
                  <div className="text-[11px] text-muted-foreground">{timeAgo(a.at)}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gradient-card rounded-2xl border border-border p-5 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold">Urgent cases</div>
            <ShieldCheck className="h-4 w-4 text-destructive" />
          </div>
          <ul className="space-y-3">
            {urgentCases.map((p) => (
              <li key={p.id}>
                <Link to="/app/projects/$id" params={{ id: p.id }} className="block rounded-xl border border-border p-3 hover-lift">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{p.title}</div>
                      <div className="text-[11px] text-muted-foreground">{p.id} · {p.city}</div>
                    </div>
                    <UrgencyBadge urgency={p.urgency} />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <StatusBadge status={p.status} />
                    {p.target > 0 && (
                      <div className="ml-auto text-[11px] text-muted-foreground">{formatPKR(p.raised)} / {formatPKR(p.target)}</div>
                    )}
                  </div>
                  {p.target > 0 && <Progress value={Math.min(100, (p.raised / p.target) * 100)} className="mt-2 h-1.5" />}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
