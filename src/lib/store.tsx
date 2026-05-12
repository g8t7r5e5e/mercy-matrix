import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ACCOUNTS, SEED_PROJECTS, type Project, type User, type ProjectStatus } from "./mock-data";

interface Notification { id: string; text: string; at: string; read: boolean; }
interface Activity { id: string; text: string; at: string; kind: "donation" | "project" | "blood" | "system" | "member"; }

interface StoreCtx {
  user: User | null;
  login: (email: string, password: string) => string | null;
  logout: () => void;
  projects: Project[];
  addProject: (p: Omit<Project, "id" | "createdAt" | "updatedAt" | "timeline" | "donations" | "messages" | "documents" | "raised"> & { raised?: number }) => string;
  updateProject: (id: string, patch: Partial<Project>) => void;
  addDonation: (projectId: string, donor: string, amount: number) => void;
  addMessage: (projectId: string, author: string, role: User["role"], text: string) => void;
  closeProject: (projectId: string) => void;
  markBloodUsed: (projectId: string) => void;
  notifications: Notification[];
  markAllNotificationsRead: () => void;
  activity: Activity[];
}

const Ctx = createContext<StoreCtx | null>(null);

const SESSION_KEY = "welfareos.session.v1";
const STATE_KEY = "welfareos.state.v1";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>(SEED_PROJECTS);
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

  // hydrate session
  useEffect(() => {
    try {
      const s = localStorage.getItem(SESSION_KEY);
      if (s) setUser(JSON.parse(s));
      const st = localStorage.getItem(STATE_KEY);
      if (st) {
        const parsed = JSON.parse(st);
        if (parsed.projects) setProjects(parsed.projects);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STATE_KEY, JSON.stringify({ projects })); } catch {}
  }, [projects]);

  const pushActivity = (text: string, kind: Activity["kind"]) =>
    setActivity((a) => [{ id: Math.random().toString(36).slice(2), text, at: new Date().toISOString(), kind }, ...a].slice(0, 30));
  const pushNotif = (text: string) =>
    setNotifications((n) => [{ id: Math.random().toString(36).slice(2), text, at: new Date().toISOString(), read: false }, ...n].slice(0, 20));

  const login = (email: string, password: string) => {
    const acc = ACCOUNTS.find((a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password);
    if (!acc) return "Invalid email or password";
    const { password: _pw, ...u } = acc;
    setUser(u);
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(u)); } catch {}
    return null;
  };
  const logout = () => {
    setUser(null);
    try { localStorage.removeItem(SESSION_KEY); } catch {}
  };

  const addProject: StoreCtx["addProject"] = (p) => {
    const id = `WOS-${100 + projects.length + Math.floor(Math.random() * 90)}`;
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

  const updateProject: StoreCtx["updateProject"] = (id, patch) => {
    setProjects((arr) => arr.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p)));
  };

  const addDonation: StoreCtx["addDonation"] = (projectId, donor, amount) => {
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
    pushActivity(`PKR ${amount.toLocaleString()} received for ${projectId}`, "donation");
    pushNotif(`PKR ${amount.toLocaleString()} received for ${projectId}`);
  };

  const addMessage: StoreCtx["addMessage"] = (projectId, author, role, text) => {
    setProjects((arr) => arr.map((p) => p.id === projectId
      ? { ...p, messages: [...p.messages, { id: Math.random().toString(36).slice(2), author, role, text, at: new Date().toISOString() }] }
      : p));
  };

  const closeProject: StoreCtx["closeProject"] = (projectId) => {
    updateProject(projectId, { status: "Closed" });
    pushActivity(`Project ${projectId} closed successfully`, "project");
    pushNotif(`Project ${projectId} closed. Donor proof emailed.`);
  };

  const markBloodUsed: StoreCtx["markBloodUsed"] = (projectId) => {
    setProjects((arr) => arr.map((p) => p.id === projectId
      ? { ...p, status: "Completed", unitsArranged: p.unitsRequired, updatedAt: new Date().toISOString() }
      : p));
    pushActivity(`Blood marked as used for ${projectId}`, "blood");
    pushNotif(`Thank-you message sent to donors for ${projectId}`);
  };

  const markAllNotificationsRead = () => setNotifications((n) => n.map((x) => ({ ...x, read: true })));

  const value = useMemo<StoreCtx>(() => ({
    user, login, logout, projects, addProject, updateProject, addDonation, addMessage,
    closeProject, markBloodUsed, notifications, markAllNotificationsRead, activity,
  }), [user, projects, notifications, activity]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore must be used inside StoreProvider");
  return c;
}
