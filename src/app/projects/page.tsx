"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Project = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  services: string | null;
  runs: string | null;
  repo: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-emerald-100 text-emerald-700" },
  paused: { label: "Paused", className: "bg-amber-100 text-amber-700" },
  "in development": { label: "In Development", className: "bg-blue-100 text-blue-700" },
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newServices, setNewServices] = useState("");
  const [newRuns, setNewRuns] = useState("");
  const [newRepo, setNewRepo] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/sqlite/projects", { cache: "no-store" });
      const data = (await res.json()) as Project[];
      setProjects(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const handleCreateProject = async () => {
    if (!newName.trim()) {
      setError("Project name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const services = newServices
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await fetch("/api/sqlite/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDescription.trim(),
          services,
          runs: newRuns.trim(),
          repo: newRepo.trim(),
        }),
      });
      const json = (await res.json()) as any;
      if (!res.ok) throw new Error(json?.error || "Failed to create project");
      await loadProjects();
      setShowNew(false);
      setNewName("");
      setNewDescription("");
      setNewServices("");
      setNewRuns("");
      setNewRepo("");
      router.push(`/projects/${(json as Project).slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-500">
            All active, paused, and in-development projects with their infrastructure details.
          </p>
        </div>
        <button onClick={() => setShowNew(!showNew)} className="btn-primary shrink-0">
          {showNew ? "Cancel" : "+ New Project"}
        </button>
      </header>

      {/* New project form */}
      {showNew && (
        <section className="surface mb-6 p-5">
          <h3 className="text-base font-semibold text-black">New Project</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input
              className="input"
              placeholder="Project name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <input
              className="input"
              placeholder="GitHub repo (e.g. coldloki/my-project)"
              value={newRepo}
              onChange={(e) => setNewRepo(e.target.value)}
            />
            <input
              className="input md:col-span-2"
              placeholder="Description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
            <input
              className="input"
              placeholder="Runs on (e.g. Mac mini)"
              value={newRuns}
              onChange={(e) => setNewRuns(e.target.value)}
            />
            <input
              className="input"
              placeholder="Services/APIs (comma-separated)"
              value={newServices}
              onChange={(e) => setNewServices(e.target.value)}
            />
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button className="btn-primary" onClick={() => void handleCreateProject()} disabled={saving}>
              {saving ? "Creating…" : "Create project"}
            </button>
            <button onClick={() => setShowNew(false)} className="rounded-xl border border-black/10 px-4 py-2 text-sm text-black/70">
              Cancel
            </button>
          </div>
          {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
        </section>
      )}

      {loading ? (
        <p className="text-sm text-black/45">Loading…</p>
      ) : projects.length === 0 ? (
        <div className="surface p-8 text-center">
          <p className="text-sm text-black/45">No projects yet.</p>
          <button onClick={() => setShowNew(true)} className="mt-3 btn-primary text-sm">
            + Create first project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((project) => {
            const status = statusConfig[project.status] ?? { label: project.status, className: "bg-zinc-100 text-zinc-700" };
            const services = project.services ? JSON.parse(project.services) : [];
            return (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col cursor-pointer"
                onClick={() => router.push(`/projects/${project.slug}`)}
              >
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-base font-semibold text-gray-900 leading-tight">
                      {project.name}
                    </h2>
                    <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${status.className}`}>
                      {status.label}
                    </span>
                  </div>

                  {project.description && (
                    <p className="text-sm text-gray-600 leading-relaxed flex-1">
                      {project.description}
                    </p>
                  )}

                  {services.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {(services as string[]).map((service) => (
                        <span key={service} className="text-xs bg-violet-50 text-violet-700 border border-violet-100 px-2 py-0.5 rounded-full">
                          {service}
                        </span>
                      ))}
                    </div>
                  )}

                  {project.runs && (
                    <p className="text-sm text-gray-700"><span className="text-xs font-semibold text-gray-400 uppercase">Runs: </span>{project.runs}</p>
                  )}

                  {project.repo && (
                    <a
                      href={`https://github.com/${project.repo}`}
                      onClick={(e) => e.stopPropagation()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {project.repo}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
