import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, FolderKanban, Activity, AlertTriangle, CheckCircle2, PlusSquare,
  Droplets, HandCoins, Heart, Users, UserPlus, ListChecks, MessagesSquare, FileBarChart,
  LineChart, Settings, ScrollText, ChevronLeft, ChevronRight, Sparkles,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const items = [
  { title: "Dashboard", url: "/app", icon: LayoutDashboard, exact: true },
  { title: "All Projects", url: "/app/projects", icon: FolderKanban },
  { title: "Active Projects", url: "/app/projects?status=Active", icon: Activity },
  { title: "Urgent Projects", url: "/app/projects?urgency=Critical", icon: AlertTriangle },
  { title: "Completed", url: "/app/projects?status=Completed", icon: CheckCircle2 },
  { title: "Submit Project", url: "/app/submit", icon: PlusSquare },
  { title: "Blood Requests", url: "/app/blood", icon: Droplets },
  { title: "Financial Aid", url: "/app/finance", icon: HandCoins },
  { title: "Donors", url: "/app/donors", icon: Heart },
  { title: "Blood Donors", url: "/app/blood-donors", icon: Droplets },
  { title: "Volunteers", url: "/app/volunteers", icon: UserPlus },
  { title: "Users", url: "/app/users", icon: Users },
  { title: "Tasks", url: "/app/tasks", icon: ListChecks },
  { title: "Messages", url: "/app/messages", icon: MessagesSquare },
  { title: "Reports", url: "/app/reports", icon: FileBarChart },
  { title: "Analytics", url: "/app/analytics", icon: LineChart },
  { title: "Settings", url: "/app/settings", icon: Settings },
  { title: "Audit Logs", url: "/app/audit", icon: ScrollText },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname + s.location.searchStr });

  return (
    <aside
      className={cn(
        "bg-gradient-sidebar text-sidebar-foreground sticky top-0 hidden h-screen flex-col border-r border-sidebar-border transition-all duration-300 lg:flex",
        collapsed ? "w-[76px]" : "w-[256px]"
      )}
    >
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand shadow-glow">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="leading-tight">
            <div className="text-sm font-semibold text-white">WelfareOS</div>
            <div className="text-[11px] text-sidebar-foreground/60">Command Center</div>
          </div>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {items.map((it) => {
          const isActive = it.exact ? path === it.url : path.startsWith(it.url.split("?")[0]) && it.url !== "/app";
          const active = it.exact ? path === "/app" : isActive;
          return (
            <Link
              key={it.title}
              to={it.url}
              className={cn(
                "group mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-white shadow-soft"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-white"
              )}
            >
              <it.icon className={cn("h-4 w-4 shrink-0", active ? "text-accent" : "text-sidebar-foreground/60 group-hover:text-white")} />
              {!collapsed && <span className="truncate">{it.title}</span>}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="mx-3 mb-4 flex items-center justify-center gap-2 rounded-lg border border-sidebar-border/60 bg-sidebar-accent/40 py-2 text-xs text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-white"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /> Collapse</>}
      </button>
    </aside>
  );
}
