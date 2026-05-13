import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { ACCOUNTS, SEED_PROJECTS, type Project, type User, type ProjectStatus, type ProjectType, type Role, type Urgency } from "./mock-data";
import { isSupabaseConfigured, supabase } from "./supabase";

interface Notification { id: string; text: string; at: string; read: boolean; }
interface Activity { id: string; text: string; at: string; kind: "donation" | "project" | "blood" | "system" | "member"; }

type ProjectInput = Omit<Project, "id" | "createdAt" | "updatedAt" | "timeline" | "donations" | "messages" | "documents" | "raised"> & { raised?: number };

interface StoreCtx {
  user: User | null;
  authLoading: boolean;
  isSupabaseAuth: boolean;
  isSupabaseData: boolean;
  projectsLoading: boolean;
  projectsError: string | null;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  projects: Project[];
  refreshProjects: (feedback?: boolean) => Promise<void>;
  addProject: (p: ProjectInput) => Promise<string>;
  updateProject: (id: string, patch: Partial<Project>) => Promise<void>;
  addDonation: (projectId: string, donor: string, amount: number) => Promise<void>;
  addMessage: (projectId: string, author: string, role: User["role"], text: string) => Promise<void>;
  addProjectUpdate: (projectId: string, text: string) => Promise<void>;
  closeProject: (projectId: string) => Promise<void>;
  markBloodUsed: (projectId: string) => Promise<void>;
  notifications: Notification[];
  markAllNotificationsRead: () => void;
  activity: Activity[];
}

const Ctx = createContext<StoreCtx | null>(null);

const SESSION_KEY = "welfareos.session.v1";
const STATE_KEY = "welfareos.state.v1";

type ProfileRow = {
  id: string;
  full_name: string | null;
  role: Role | null;
  wing_id?: string | null;
  wing?: { name: string | null } | Array<{ name: string | null }> | null;
};

type ProjectRow = {
  id: string;
  wing_id: string | null;
  submitted_by: string | null;
  assigned_to: string | null;
  title: string;
  summary: string | null;
  description: string | null;
  project_type: string;
  status: string;
  urgency: string;
  beneficiary_name: string | null;
  beneficiary_contact: string | null;
  location: string | null;
  target_amount: number | string | null;
  raised_amount: number | string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

type ProjectUpdateRow = {
  id: string;
  project_id: string;
  author_id: string | null;
  title: string | null;
  body: string;
  created_at: string;
};

type DonationRow = {
  id: string;
  project_id: string;
  donor_name: string | null;
  amount: number | string;
  created_at: string;
  donated_at: string | null;
};

type MessageRow = {
  id: string;
  project_id: string;
  message: string;
  sender_id: string | null;
  created_at: string;
};

type BloodRequestRow = {
  project_id: string;
  blood_group: string;
  units_needed: number;
  hospital_name: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  status: string;
};

type WingRow = { id: string; name: string; slug: string };

type ProfileLookupRow = { id: string; full_name: string | null; role: Role | null };

function getWingName(profile: ProfileRow) {
  if (Array.isArray(profile.wing)) return profile.wing[0]?.name ?? undefined;
  return profile.wing?.name ?? undefined;
}

async function loadSupabaseUser(authUserId: string, email?: string | null): Promise<User> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, wing_id, wing:wings(name)")
    .eq("id", authUserId)
    .single<ProfileRow>();

  if (error || !profile) {
    throw new Error("Your account is signed in, but no matching WelfareOS profile was found.");
  }

  return {
    id: profile.id,
    name: profile.full_name || email || "WelfareOS User",
    email: email || "",
    role: profile.role || "general_user",
    wing: getWingName(profile),
    wingId: profile.wing_id || undefined,
  };
}

const projectTypeToDb: Record<ProjectType, string> = {
  "Medical Aid": "medical_aid",
  "Blood Donation": "blood_request",
  "Financial Aid": "financial_aid",
  "Welfare Campaign": "welfare_campaign",
  "Community Support": "community_support",
  "Emergency Patient": "emergency_support",
};

const projectTypeFromDb: Record<string, ProjectType> = {
  medical_aid: "Medical Aid",
  blood_request: "Blood Donation",
  financial_aid: "Financial Aid",
  welfare_campaign: "Welfare Campaign",
  community_support: "Community Support",
  emergency_support: "Emergency Patient",
};

const statusToDb: Record<ProjectStatus, string> = {
  "Pending Review": "pending_review",
  Verified: "verified",
  Active: "active",
  "In Progress": "active",
  "Partially Funded": "partially_funded",
  "Donor Matched": "donor_matched",
  Completed: "completed",
  Closed: "closed",
  Archived: "archived",
  Rejected: "rejected",
};

const statusFromDb: Record<string, ProjectStatus> = {
  pending_review: "Pending Review",
  verified: "Verified",
  assigned: "Verified",
  active: "Active",
  partially_funded: "Partially Funded",
  donor_matched: "Donor Matched",
  completed: "Completed",
  closed: "Closed",
  archived: "Archived",
  rejected: "Rejected",
};

const urgencyToDb: Record<Urgency, string> = { Low: "low", Medium: "medium", High: "high", Critical: "critical" };
const urgencyFromDb: Record<string, Urgency> = { low: "Low", medium: "Medium", high: "High", critical: "Critical" };

const safeNumber = (value: unknown) => Number(value ?? 0) || 0;
const safeString = (value: unknown) => (typeof value === "string" ? value : undefined);

function makeProjectCode(rows: Project[]) {
  const max = rows.reduce((highest, p) => {
    const match = p.id.match(/WOS-(\d+)/i);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 100);
  return `WOS-${String(max + 1).padStart(3, "0")}`;
}

function wingNameForType(type: ProjectType) {
  if (type === "Blood Donation") return "Blood Wing";
  if (type === "Financial Aid") return "Finance Wing";
  if (type === "Welfare Campaign" || type === "Community Support") return "Volunteer Wing";
  return "Medical Aid Wing";
}

function buildClientActivity(projects: Project[]): Activity[] {
  return projects
    .flatMap((p) => [
      { id: `${p.id}-created`, text: `${p.id} submitted: ${p.title}`, at: p.createdAt, kind: "project" as const },
      ...(p.timeline || []).map((t) => ({ id: `${p.id}-${t.id}`, text: `${p.id}: ${t.text}`, at: t.at, kind: p.type === "Blood Donation" ? "blood" as const : "project" as const })),
    ])
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 30);
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>(SEED_PROJECTS);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: "n1", text: "New project WOS-106 awaiting review", at: new Date().toISOString(), read: false },
    { id: "n2", text: "2 donors matched for blood request WOS-102", at: new Date().toISOString(), read: false },
    { id: "n3", text: "PKR 162,000 received for WOS-101", at: new Date().toISOString(), read: false },
  ]);
  const [activity, setActivity] = useState<Activity[]>([
    { id: "a1", text: "Donor matched for blood request WOS-102", at: new Date(Date.now() - 1000 * 60 * 12).toISOString(), kind: "blood" },
    { id: "a2", text: "PKR 162,000 received for WOS-101", at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), kind: "donation" },
    { id: "a3", text: "Volunteer assigned to hospital verification", at: new Date(Date.now() - 1000 * 60 * 90).toISOString(), kind: "member" },
    { id: "a4", text: "Project WOS-107 closed successfully", at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), kind: "project" },
    { id: "a5", text: "Proof uploaded by Finance Wing", at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), kind: "system" },
  ]);

  const pushActivity = useCallback((text: string, kind: Activity["kind"]) =>
    setActivity((a) => [{ id: Math.random().toString(36).slice(2), text, at: new Date().toISOString(), kind }, ...a].slice(0, 30)), []);
  const pushNotif = useCallback((text: string) =>
    setNotifications((n) => [{ id: Math.random().toString(36).slice(2), text, at: new Date().toISOString(), read: false }, ...n].slice(0, 20)), []);

  const loadProjectsFromSupabase = useCallback(async (feedback = false) => {
    if (!isSupabaseConfigured || !supabase) return;
    setProjectsLoading(true);
    setProjectsError(null);
    try {
      const { data: projectRows, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .order("updated_at", { ascending: false });
      if (projectError) throw projectError;

      const rows = (projectRows ?? []) as ProjectRow[];
      const projectIds = rows.map((p) => p.id);
      const profileIds = Array.from(new Set(rows.flatMap((p) => [p.assigned_to, p.submitted_by]).filter(Boolean) as string[]));

      const [wingsRes, updatesRes, donationsRes, messagesRes, bloodRes, profilesRes] = await Promise.all([
        supabase.from("wings").select("id, name, slug"),
        projectIds.length ? supabase.from("project_updates").select("id, project_id, author_id, title, body, created_at").in("project_id", projectIds).order("created_at", { ascending: false }) : Promise.resolve({ data: [], error: null }),
        projectIds.length ? supabase.from("donations").select("id, project_id, donor_name, amount, donated_at, created_at").in("project_id", projectIds).order("created_at", { ascending: false }) : Promise.resolve({ data: [], error: null }),
        projectIds.length ? supabase.from("project_messages").select("id, project_id, message, sender_id, created_at").in("project_id", projectIds).order("created_at", { ascending: true }) : Promise.resolve({ data: [], error: null }),
        projectIds.length ? supabase.from("blood_requests").select("project_id, blood_group, units_needed, hospital_name, contact_name, contact_phone, status").in("project_id", projectIds) : Promise.resolve({ data: [], error: null }),
        profileIds.length ? supabase.from("profiles").select("id, full_name, role").in("id", profileIds) : Promise.resolve({ data: [], error: null }),
      ]);

      const optionalErrors = [updatesRes.error, donationsRes.error, messagesRes.error, bloodRes.error, profilesRes.error].filter(Boolean);
      if (wingsRes.error) throw wingsRes.error;
      if (optionalErrors.length && import.meta.env.DEV) console.warn("Some project companion data could not be loaded", optionalErrors);

      const wingById = new Map(((wingsRes.data ?? []) as WingRow[]).map((w) => [w.id, w.name]));
      const profileById = new Map(((profilesRes.data ?? []) as ProfileLookupRow[]).map((p) => [p.id, p]));
      const updates = ((updatesRes.data ?? []) as ProjectUpdateRow[]).reduce<Record<string, ProjectUpdateRow[]>>((acc, row) => {
        (acc[row.project_id] ||= []).push(row);
        return acc;
      }, {});
      const donations = ((donationsRes.data ?? []) as DonationRow[]).reduce<Record<string, DonationRow[]>>((acc, row) => {
        (acc[row.project_id] ||= []).push(row);
        return acc;
      }, {});
      const messages = ((messagesRes.data ?? []) as MessageRow[]).reduce<Record<string, MessageRow[]>>((acc, row) => {
        (acc[row.project_id] ||= []).push(row);
        return acc;
      }, {});
      const bloodByProject = new Map(((bloodRes.data ?? []) as BloodRequestRow[]).map((b) => [b.project_id, b]));

      const mapped = rows.map<Project>((row) => {
        const metadata = row.metadata ?? {};
        const blood = bloodByProject.get(row.id);
        const code = safeString(metadata.project_code) || `WOS-${row.id.slice(0, 8).toUpperCase()}`;
        const timeline = (updates[row.id] ?? []).map((u) => ({
          id: u.id,
          at: u.created_at,
          actor: profileById.get(u.author_id || "")?.full_name || "WelfareOS",
          text: u.title ? `${u.title}: ${u.body}` : u.body,
        }));

        return {
          dbId: row.id,
          id: code,
          title: row.title,
          type: projectTypeFromDb[row.project_type] ?? "Medical Aid",
          status: statusFromDb[row.status] ?? "Pending Review",
          urgency: urgencyFromDb[row.urgency] ?? "Medium",
          wing: row.wing_id ? wingById.get(row.wing_id) || "Unassigned Wing" : "Unassigned Wing",
          assignedMember: row.assigned_to ? profileById.get(row.assigned_to)?.full_name || "Assigned member" : safeString(metadata.assigned_member_name) || "—",
          city: safeString(metadata.city) || row.location || "—",
          hospital: blood?.hospital_name || safeString(metadata.hospital) || undefined,
          requester: row.beneficiary_name || safeString(metadata.requester) || "Requester",
          contact: row.beneficiary_contact || safeString(metadata.contact) || "—",
          description: row.description || row.summary || "No description provided yet.",
          target: safeNumber(row.target_amount),
          raised: safeNumber(row.raised_amount),
          bloodGroup: blood?.blood_group || safeString(metadata.blood_group),
          unitsRequired: blood?.units_needed || safeNumber(metadata.units_required) || undefined,
          unitsArranged: safeNumber(metadata.units_arranged),
          livesImpacted: safeNumber(metadata.lives_impacted) || undefined,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          timeline: timeline.length ? timeline : [{ id: `${row.id}-submitted`, at: row.created_at, actor: row.beneficiary_name || "Requester", text: "Project submitted" }],
          donations: (donations[row.id] ?? []).map((d) => ({ id: d.id, donor: d.donor_name || "Anonymous", amount: safeNumber(d.amount), at: d.donated_at || d.created_at })),
          messages: (messages[row.id] ?? []).map((m) => ({ id: m.id, author: profileById.get(m.sender_id || "")?.full_name || "Team", role: profileById.get(m.sender_id || "")?.role || "member", text: m.message, at: m.created_at })),
          documents: [],
          metadata,
        };
      });

      setProjects(mapped);
      setActivity(buildClientActivity(mapped));
      if (feedback) toast.success("Project data refreshed");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load Supabase projects.";
      setProjectsError(message);
      if (feedback) toast.error(message);
      console.error(error);
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  // hydrate persisted mock project state and whichever auth mode is available
  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      if (!isSupabaseConfigured || !supabase) {
        try {
          const st = localStorage.getItem(STATE_KEY);
          if (st) {
            const parsed = JSON.parse(st);
            if (parsed.projects) setProjects(parsed.projects);
          }
          const s = localStorage.getItem(SESSION_KEY);
          if (s && !cancelled) setUser(JSON.parse(s));
        } catch {}
        if (!cancelled) setAuthLoading(false);
        return;
      }

      // Safety: never let hydration hang forever (e.g. if Supabase is unreachable)
      const safety = window.setTimeout(() => {
        if (!cancelled) setAuthLoading(false);
      }, 4000);

      try {
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;

        if (!data.session?.user) {
          setUser(null);
          return;
        }

        try {
          const nextUser = await loadSupabaseUser(data.session.user.id, data.session.user.email);
          if (!cancelled) setUser(nextUser);
        } catch (error) {
          console.error(error);
          if (!cancelled) setUser(null);
        }
      } catch (error) {
        console.error("Auth hydration failed", error);
        if (!cancelled) setUser(null);
      } finally {
        window.clearTimeout(safety);
        if (!cancelled) setAuthLoading(false);
      }
    };

    void hydrate();

    if (!isSupabaseConfigured || !supabase) {
      return () => { cancelled = true; };
    }

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      if (!session?.user) {
        setUser(null);
        setProjects(SEED_PROJECTS);
        setAuthLoading(false);
        return;
      }
      setAuthLoading(true);
      window.setTimeout(() => {
        void loadSupabaseUser(session.user.id, session.user.email)
          .then((nextUser) => { if (!cancelled) setUser(nextUser); })
          .catch((error) => {
            console.error(error);
            if (!cancelled) setUser(null);
          })
          .finally(() => { if (!cancelled) setAuthLoading(false); });
      }, 0);
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    try { localStorage.setItem(STATE_KEY, JSON.stringify({ projects })); } catch {}
  }, [projects]);

  useEffect(() => {
    if (!user || !isSupabaseConfigured) return;
    void loadProjectsFromSupabase();
  }, [user, loadProjectsFromSupabase]);

  useEffect(() => {
    if (!user || !isSupabaseConfigured || !supabase) return;
    const channel = supabase
      .channel("phase5-project-system")
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, (payload) => {
        void loadProjectsFromSupabase();
        if (payload.eventType === "INSERT") toast.info("A new project was added.");
        if (payload.eventType === "UPDATE") toast.info("A project was updated.");
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "project_updates" }, () => { void loadProjectsFromSupabase(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => { void loadProjectsFromSupabase(); })
      .subscribe((status) => {
        if (import.meta.env.DEV) console.info("Supabase realtime status", status);
      });

    const client = supabase;
    return () => { void client.removeChannel(channel); };
  }, [user, loadProjectsFromSupabase]);

  const login = async (email: string, password: string) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) return "Invalid email or password";

      try {
        const nextUser = await loadSupabaseUser(data.user.id, data.user.email);
        setUser(nextUser);
        return null;
      } catch (profileError) {
        console.error(profileError);
        await supabase.auth.signOut();
        setUser(null);
        return profileError instanceof Error ? profileError.message : "Unable to load your WelfareOS profile.";
      }
    }

    const acc = ACCOUNTS.find((a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password);
    if (!acc) return "Invalid email or password";
    const { password: _pw, ...u } = acc;
    setUser(u);
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(u)); } catch {}
    return null;
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    try { localStorage.removeItem(SESSION_KEY); } catch {}
  };

  const addProject: StoreCtx["addProject"] = async (p) => {
    if (isSupabaseConfigured && supabase && user) {
      const code = makeProjectCode(projects);
      const wingName = p.wing || wingNameForType(p.type);
      const { data: wing } = await supabase.from("wings").select("id").eq("name", wingName).maybeSingle<{ id: string }>();
      const metadata = {
        project_code: code,
        city: p.city,
        hospital: p.hospital,
        requester: p.requester,
        contact: p.contact,
        blood_group: p.bloodGroup,
        units_required: p.unitsRequired,
        units_arranged: p.unitsArranged ?? 0,
        lives_impacted: p.livesImpacted ?? 1,
      };

      const { data: inserted, error } = await supabase
        .from("projects")
        .insert({
          title: p.title,
          summary: p.description?.slice(0, 180),
          description: p.description,
          project_type: projectTypeToDb[p.type],
          status: "pending_review",
          urgency: urgencyToDb[p.urgency],
          wing_id: wing?.id ?? null,
          submitted_by: user.id,
          beneficiary_name: p.requester,
          beneficiary_contact: p.contact,
          location: p.city,
          target_amount: Number(p.target) || 0,
          raised_amount: Number(p.raised) || 0,
          metadata,
        })
        .select("id")
        .single<{ id: string }>();

      if (error || !inserted) throw error ?? new Error("Project submission failed.");

      await Promise.allSettled([
        supabase.from("project_updates").insert({ project_id: inserted.id, author_id: user.id, title: "Project submitted", body: `${code} submitted for review.`, is_public: true }),
        p.type === "Blood Donation" && p.bloodGroup ? supabase.from("blood_requests").insert({ project_id: inserted.id, requested_by: user.id, patient_name: p.requester, blood_group: p.bloodGroup, units_needed: p.unitsRequired || 1, hospital_name: p.hospital, contact_name: p.requester, contact_phone: p.contact, status: "open" }) : Promise.resolve(),
        supabase.from("notifications").insert({ recipient_id: user.id, project_id: inserted.id, title: "Project submitted", body: `${code} is awaiting review.`, type: "project" }),
        user.role === "super_admin" ? supabase.from("audit_logs").insert({ project_id: inserted.id, actor_id: user.id, action: "project_submitted", entity_table: "projects", entity_id: inserted.id, new_values: { code, title: p.title } }) : Promise.resolve(),
      ]);

      await loadProjectsFromSupabase();
      pushNotif(`New project ${code} submitted: ${p.title}`);
      pushActivity(`New ${p.type.toLowerCase()} project submitted (${code})`, "project");
      return code;
    }

    const id = makeProjectCode(projects);
    const np: Project = {
      ...p, id, raised: p.raised ?? 0,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      timeline: [{ id: "t0", at: new Date().toISOString(), actor: p.requester, text: "Project submitted" }],
      donations: [], messages: [], documents: [],
    };
    setProjects((arr) => [np, ...arr]);
    pushNotif(`New project ${id} submitted: ${p.title}`);
    pushActivity(`New ${p.type.toLowerCase()} project submitted (${id})`, "project");
    return id;
  };

  const updateProject: StoreCtx["updateProject"] = async (id, patch) => {
    const current = projects.find((p) => p.id === id || p.dbId === id);
    if (isSupabaseConfigured && supabase && current?.dbId) {
      const dbPatch: Record<string, unknown> = {};
      if (patch.status) {
        dbPatch.status = statusToDb[patch.status];
        if (patch.status === "Completed") dbPatch.completed_at = new Date().toISOString();
        if (patch.status === "Verified") dbPatch.verified_at = new Date().toISOString();
      }
      if (patch.raised !== undefined) dbPatch.raised_amount = patch.raised;
      if (patch.target !== undefined) dbPatch.target_amount = patch.target;
      if (patch.assignedMember !== undefined) dbPatch.metadata = { ...(current.metadata ?? {}), assigned_member_name: patch.assignedMember };
      const { error } = await supabase.from("projects").update(dbPatch).eq("id", current.dbId);
      if (error) throw error;
      if (patch.status && user) {
        await Promise.allSettled([
          supabase.from("project_updates").insert({ project_id: current.dbId, author_id: user.id, title: "Status updated", body: `Status changed to ${patch.status}.`, status: statusToDb[patch.status], is_public: true }),
          supabase.from("notifications").insert({ recipient_id: user.id, project_id: current.dbId, title: "Project status updated", body: `${current.id} is now ${patch.status}.`, type: "project" }),
        ]);
      }
      await loadProjectsFromSupabase();
    } else {
      setProjects((arr) => arr.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString(), timeline: patch.status ? [{ id: Math.random().toString(36).slice(2), at: new Date().toISOString(), actor: user?.name || "System", text: `Status changed to ${patch.status}` }, ...p.timeline] : p.timeline } : p)));
    }
    if (patch.status) {
      pushActivity(`Project ${current?.id ?? id} status changed to ${patch.status}`, "project");
      pushNotif(`Project ${current?.id ?? id} status updated to ${patch.status}`);
    }
  };

  const addDonation: StoreCtx["addDonation"] = async (projectId, donor, amount) => {
    const current = projects.find((p) => p.id === projectId || p.dbId === projectId);
    if (isSupabaseConfigured && supabase && current?.dbId) {
      const raised = current.raised + amount;
      await Promise.allSettled([
        supabase.from("donations").insert({ project_id: current.dbId, donor_name: donor, amount, currency: "PKR", status: "received", donated_at: new Date().toISOString() }),
        supabase.from("projects").update({ raised_amount: raised, status: raised >= current.target && current.target > 0 ? "donor_matched" : "partially_funded" }).eq("id", current.dbId),
      ]);
      await loadProjectsFromSupabase();
    } else {
      setProjects((arr) => arr.map((p) => {
        if (p.id !== projectId) return p;
        const d = { id: Math.random().toString(36).slice(2), donor, amount, at: new Date().toISOString() };
        const raised = p.raised + amount;
        const status: ProjectStatus = raised >= p.target ? "Donor Matched" : "Partially Funded";
        return {
          ...p, raised, status, updatedAt: new Date().toISOString(),
          donations: [d, ...p.donations],
          timeline: [{ id: Math.random().toString(36).slice(2), at: new Date().toISOString(), actor: donor, text: `Donation of PKR ${amount.toLocaleString()} received` }, ...p.timeline],
        };
      }));
    }
    pushActivity(`PKR ${amount.toLocaleString()} received for ${projectId}`, "donation");
    pushNotif(`PKR ${amount.toLocaleString()} received for ${projectId}`);
  };

  const addMessage: StoreCtx["addMessage"] = async (projectId, author, role, text) => {
    const current = projects.find((p) => p.id === projectId || p.dbId === projectId);
    if (isSupabaseConfigured && supabase && current?.dbId && user) {
      const { error } = await supabase.from("project_messages").insert({ project_id: current.dbId, sender_id: user.id, message: text, is_internal: true });
      if (error) throw error;
      await loadProjectsFromSupabase();
    } else {
      setProjects((arr) => arr.map((p) => p.id === projectId
        ? { ...p, messages: [...p.messages, { id: Math.random().toString(36).slice(2), author, role, text, at: new Date().toISOString() }] }
        : p));
    }
  };


  const addProjectUpdate: StoreCtx["addProjectUpdate"] = async (projectId, text) => {
    const current = projects.find((p) => p.id === projectId || p.dbId === projectId);
    if (isSupabaseConfigured && supabase && current?.dbId && user) {
      const { error } = await supabase.from("project_updates").insert({ project_id: current.dbId, author_id: user.id, title: "Timeline note", body: text, is_public: true });
      if (error) throw error;
      await loadProjectsFromSupabase();
    } else {
      setProjects((arr) => arr.map((p) => p.id === projectId
        ? { ...p, updatedAt: new Date().toISOString(), timeline: [{ id: Math.random().toString(36).slice(2), at: new Date().toISOString(), actor: user?.name || "System", text }, ...p.timeline] }
        : p));
    }
    pushActivity(`${current?.id ?? projectId}: ${text}`, "project");
    pushNotif(`Update added to ${current?.id ?? projectId}`);
  };

  const closeProject: StoreCtx["closeProject"] = async (projectId) => {
    await updateProject(projectId, { status: "Closed" });
    pushActivity(`Project ${projectId} closed successfully`, "project");
    pushNotif(`Project ${projectId} closed. Donor proof emailed.`);
  };

  const markBloodUsed: StoreCtx["markBloodUsed"] = async (projectId) => {
    const current = projects.find((p) => p.id === projectId || p.dbId === projectId);
    if (isSupabaseConfigured && supabase && current?.dbId) {
      await Promise.allSettled([
        supabase.from("projects").update({ status: "completed", completed_at: new Date().toISOString(), metadata: { ...(current.metadata ?? {}), units_arranged: current.unitsRequired ?? current.unitsArranged ?? 0 } }).eq("id", current.dbId),
        supabase.from("blood_requests").update({ status: "fulfilled" }).eq("project_id", current.dbId),
      ]);
      await loadProjectsFromSupabase();
    } else {
      setProjects((arr) => arr.map((p) => p.id === projectId
        ? { ...p, status: "Completed", unitsArranged: p.unitsRequired, updatedAt: new Date().toISOString() }
        : p));
    }
    pushActivity(`Blood marked as used for ${projectId}`, "blood");
    pushNotif(`Thank-you message sent to donors for ${projectId}`);
  };

  const markAllNotificationsRead = () => setNotifications((n) => n.map((x) => ({ ...x, read: true })));

  const value = useMemo<StoreCtx>(() => ({
    user, authLoading, isSupabaseAuth: isSupabaseConfigured, isSupabaseData: isSupabaseConfigured,
    projectsLoading, projectsError, login, logout, projects, refreshProjects: loadProjectsFromSupabase,
    addProject, updateProject, addDonation, addMessage, addProjectUpdate, closeProject, markBloodUsed,
    notifications, markAllNotificationsRead, activity,
  }), [user, authLoading, projectsLoading, projectsError, projects, notifications, activity, loadProjectsFromSupabase]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore must be used inside StoreProvider");
  return c;
}
