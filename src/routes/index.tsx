import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Heart, ShieldCheck, Sparkles, Users, Activity, Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WelfareOS — Social Welfare Command Center" },
      {
        name: "description",
        content:
          "WelfareOS is the centralized command center for managing welfare projects, blood requests, donations, and volunteers — transparent, real-time, and built for impact.",
      },
      { property: "og:title", content: "WelfareOS — Social Welfare Command Center" },
      {
        property: "og:description",
        content:
          "Run your entire welfare operation from one beautiful dashboard. Cases, donors, blood, and volunteers — all in real time.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 -z-10 bg-glow" />
      <div className="absolute -left-40 top-20 -z-10 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute -right-40 bottom-0 -z-10 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand shadow-glow">
            <Sparkles className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">WelfareOS</div>
            <div className="text-[10px] text-muted-foreground">Mercy Matrix</div>
          </div>
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link to="/login">
            <Button size="sm" className="bg-gradient-brand shadow-soft hover:opacity-90">
              Get started <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-12 lg:pt-20">
        <section className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground shadow-soft">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              Live • Social Welfare Command Center
            </div>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Run your entire welfare operation from{" "}
              <span className="text-gradient">one beautiful dashboard</span>.
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Manage cases, blood requests, financial aid, donors, and volunteers in real time.
              Transparent. Auditable. Built for impact.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/login">
                <Button size="lg" className="bg-gradient-brand shadow-glow hover:opacity-90">
                  Open the dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">
                  Try a demo account
                </Button>
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-3 max-w-md">
              {[
                { icon: Heart, label: "1,284", sub: "lives impacted" },
                { icon: ShieldCheck, label: "100%", sub: "transparent" },
                { icon: Users, label: "Multi-role", sub: "access" },
              ].map((s) => (
                <div key={s.sub} className="rounded-xl border border-border bg-card/60 p-3 shadow-soft">
                  <s.icon className="mb-2 h-4 w-4 text-primary" />
                  <div className="text-sm font-semibold">{s.label}</div>
                  <div className="text-[11px] text-muted-foreground">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-fade-in-up">
            <div className="glass rounded-2xl border border-border p-5 shadow-elev">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Today's overview</div>
                  <div className="text-lg font-semibold">Welfare Operations</div>
                </div>
                <div className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary">
                  Live
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { icon: Activity, label: "Active cases", value: "37" },
                  { icon: Droplet, label: "Blood requests", value: "8" },
                  { icon: Heart, label: "Funds raised", value: "৳ 4.2L" },
                  { icon: Users, label: "Volunteers", value: "126" },
                ].map((k) => (
                  <div key={k.label} className="rounded-xl border border-border bg-background/60 p-3">
                    <k.icon className="mb-1.5 h-4 w-4 text-primary" />
                    <div className="text-xl font-semibold">{k.value}</div>
                    <div className="text-[11px] text-muted-foreground">{k.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-border bg-background/60 p-3">
                <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                  Recent activity
                </div>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-center justify-between">
                    <span>৳5,000 donated to Asha's surgery</span>
                    <span className="text-muted-foreground">2m</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>O+ blood request verified</span>
                    <span className="text-muted-foreground">14m</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>New volunteer onboarded</span>
                    <span className="text-muted-foreground">1h</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-muted-foreground sm:flex-row">
          <div>© WelfareOS 2026 · Built for transparent welfare</div>
          <div className="flex gap-4">
            <Link to="/login" className="hover:text-foreground">Sign in</Link>
            <Link to="/app" className="hover:text-foreground">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
