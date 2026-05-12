import { Bell, LogOut, Plus, Search } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/format";

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Admin",
  wing_head: "Wing Head",
  member: "Member",
  general_user: "General User",
};

export function Topbar() {
  const { user, logout, notifications, markAllNotificationsRead } = useStore();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const unread = notifications.filter((n) => !n.read).length;

  if (!user) return null;
  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  return (
    <header className="glass sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border px-4 lg:px-6">
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
              <div className="text-[10px] text-muted-foreground">{ROLE_LABEL[user.role]}</div>
            </div>
            <Badge variant="secondary" className="hidden lg:inline-flex">{ROLE_LABEL[user.role]}</Badge>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="text-sm">{user.name}</div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate({ to: "/app/settings" })}>Settings</DropdownMenuItem>
          <DropdownMenuItem onClick={() => { logout(); navigate({ to: "/login" }); }}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
