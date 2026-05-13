import { Bell, LogOut, Plus, Search, ArrowLeft, Menu, Sparkles } from "lucide-react";
import { Link, useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, FolderKanban, Activity, AlertTriangle, CheckCircle2, PlusSquare,
  Droplets, HandCoins, Heart, Users, UserPlus, ListChecks, MessagesSquare, FileBarChart,
  LineChart, Settings, ScrollText,
} from "lucide-react";

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Admin",
  wing_head: "Wing Head",
  member: "Member",
  volunteer: "Volunteer",
  general_user: "General User",
  donor: "Donor",
  blood_donor: "Blood Donor",
};

const MENU = [
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

export function Topbar() {
  const { user, logout, notifications, markAllNotificationsRead } = useStore();
  const navigate = useNavigate();
  const router = useRouter();
  const path = useRouterState({ select: (s) => s.location.pathname + s.location.searchStr });
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  if (!user) return null;
  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  const handleBack = () => {
    if (window.history.length > 1) router.history.back();
    else navigate({ to: "/app" });
  };

  return (
    <header className="glass sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border px-3 lg:px-6">
      <Button
        variant="outline"
        size="sm"
        onClick={handleBack}
        className="shrink-0 gap-1"
        aria-label="Go back"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Back</span>
      </Button>

      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && q && navigate({ to: "/app/projects", search: { q } as any })}
          placeholder="Search projects, donors, members..."
          className="h-10 w-full rounded-xl border border-input bg-background/60 pl-10 pr-4 text-sm outline-none transition focus:border-ring focus:bg-background"
        />
      </div>

      <Link to="/app/submit">
        <Button className="hidden bg-gradient-brand shadow-soft hover:opacity-90 sm:inline-flex">
          <Plus className="mr-1 h-4 w-4" /> Submit Project
        </Button>
      </Link>

      <DropdownMenu onOpenChange={(o) => o && markAllNotificationsRead()}>
        <DropdownMenuTrigger asChild>
          <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card hover-lift">
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                {unread}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.length === 0 && <div className="p-4 text-sm text-muted-foreground">All caught up.</div>}
          {notifications.slice(0, 8).map((n) => (
            <div key={n.id} className="px-3 py-2 text-sm hover:bg-muted">
              <div>{n.text}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">{timeAgo(n.at)}</div>
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-xl border border-border bg-card px-2 py-1.5 hover-lift">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-gradient-brand text-xs text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <div className="hidden text-left leading-tight md:block">
              <div className="text-xs font-semibold">{user.name}</div>
              <div className="text-[10px] text-muted-foreground">{ROLE_LABEL[user.role] ?? user.role}</div>
            </div>
            <Badge variant="secondary" className="hidden lg:inline-flex">{ROLE_LABEL[user.role] ?? user.role}</Badge>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="text-sm">{user.name}</div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate({ to: "/app/settings" })}>Settings</DropdownMenuItem>
          <DropdownMenuItem onClick={() => { void logout().finally(() => navigate({ to: "/login" })); }}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger asChild>
          <button
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card hover-lift"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[280px] bg-gradient-sidebar p-0 text-sidebar-foreground border-sidebar-border">
          <div className="flex items-center gap-3 px-4 py-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-white">WelfareOS</div>
              <div className="text-[11px] text-sidebar-foreground/60">Command Center</div>
            </div>
          </div>
          <nav className="px-2 pb-6 max-h-[calc(100vh-80px)] overflow-y-auto">
            {MENU.map((it) => {
              const base = it.url.split("?")[0];
              const active = it.exact ? path === it.url : path.startsWith(base) && base !== "/app";
              return (
                <Link
                  key={it.title}
                  to={it.url}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "group mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-white shadow-soft"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-white"
                  )}
                >
                  <it.icon className={cn("h-4 w-4 shrink-0", active ? "text-accent" : "text-sidebar-foreground/60 group-hover:text-white")} />
                  <span className="truncate">{it.title}</span>
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
