import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Sparkles, ShieldCheck, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const QUICK = [
  { label: "Super Admin", email: "admin@welfareos.org" },
  { label: "Wing Head", email: "head@welfareos.org" },
  { label: "Member", email: "member@welfareos.org" },
  { label: "General User", email: "user@welfareos.org" },
];

function LoginPage() {
  const { user, login } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@welfareos.org");
  const [password, setPassword] = useState("password123");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate({ to: "/app" }); }, [user, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const error = login(email, password);
      setLoading(false);
      if (error) { setErr(error); return; }
      toast.success("Welcome back to WelfareOS");
      navigate({ to: "/app" });
    }, 350);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10 bg-glow" />
      <div className="absolute -left-32 top-32 -z-10 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute -right-32 bottom-0 -z-10 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />

      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-2">
        <div className="hidden flex-col justify-between p-12 lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand shadow-glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-semibold">WelfareOS</div>
              <div className="text-xs text-muted-foreground">Social Welfare Command Center</div>
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight">
              One platform to run your <span className="text-gradient">entire welfare operation</span>.
            </h1>
            <p className="mt-4 max-w-md text-muted-foreground">
              From medical aid and blood requests to financial campaigns — track every project, donor, and life impacted in real time.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                { icon: Heart, label: "1,284 lives impacted" },
                { icon: ShieldCheck, label: "100% transparent" },
                { icon: Users, label: "Multi-role access" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border bg-card/60 p-3 text-xs shadow-soft">
                  <s.icon className="mb-2 h-4 w-4 text-primary" />
                  {s.label}
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">© WelfareOS 2026 · Built for transparent welfare</div>
        </div>

        <div className="flex items-center justify-center p-6 lg:p-12">
          <form onSubmit={submit} className="glass w-full max-w-md rounded-2xl border border-border p-8 shadow-elev animate-fade-in-up">
            <div className="mb-6 lg:hidden flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="font-semibold">WelfareOS</div>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
            <p className="mt-1 text-sm text-muted-foreground">Use a demo account to explore the platform.</p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Password</label>
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring"
                />
              </div>

              {err && <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">{err}</div>}

              <Button type="submit" disabled={loading} className="h-11 w-full bg-gradient-brand shadow-glow hover:opacity-90">
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </div>

            <div className="mt-6">
              <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">Quick demo accounts</div>
              <div className="grid grid-cols-2 gap-2">
                {QUICK.map((q) => (
                  <button
                    key={q.email}
                    type="button"
                    onClick={() => { setEmail(q.email); setPassword("password123"); }}
                    className="rounded-lg border border-border bg-card px-3 py-2 text-left text-xs hover-lift"
                  >
                    <div className="font-medium">{q.label}</div>
                    <div className="text-muted-foreground truncate">{q.email}</div>
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
