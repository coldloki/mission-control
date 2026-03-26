"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type TaskType = "recurring" | "one-off" | "goal";
type TaskStatus = "todo" | "in_progress" | "done" | "blocked";
type TaskPriority = "low" | "high" | "critical";
type TaskRunStatus = "ok" | "error" | "skipped";

type SortKey = "dueDate" | "createdAt" | "type" | "priority";
type SortDir = "asc" | "desc";

type Task = {
  id: string;
  title: string;
  details: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  schedule: string | null;
  milestones: string[];
  automationPrompt: string | null;
  lastRunAt: string | null;
  lastRunStatus: TaskRunStatus | null;
  cronJobId: string | null;
  createdAt: string;
  updatedAt: string;
};

const priorityOrder: Record<TaskPriority, number> = { critical: 0, high: 1, low: 2 };

type TaskPayload = {
  title?: string;
  details?: string;
  type?: TaskType;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  schedule?: string | null;
  milestones?: string[];
  automationPrompt?: string | null;
  lastRunAt?: string | null;
  lastRunStatus?: TaskRunStatus | null;
  cronJobId?: string | null;
};

const typeLabels: Record<TaskType, string> = {
  recurring: "Recurring",
  "one-off": "One-off",
  goal: "Long-term goal",
};

const statusLabels: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
  blocked: "Blocked",
};

const statusBadgeClass: Record<TaskStatus, string> = {
  todo: "bg-zinc-100 text-zinc-700",
  in_progress: "bg-blue-100 text-blue-700",
  done: "bg-emerald-100 text-emerald-700",
  blocked: "bg-rose-100 text-rose-700",
};

const priorityBadgeClass: Record<TaskPriority, string> = {
  low: "bg-zinc-100 text-zinc-700",
  high: "bg-amber-100 text-amber-700",
  critical: "bg-rose-100 text-rose-700",
};

const priorityLabels: Record<TaskPriority, string> = {
  critical: "Critical",
  high: "High",
  low: "Low",
};

const initialForm = {
  title: "",
  details: "",
  type: "one-off" as TaskType,
  priority: "high" as TaskPriority,
  dueDate: "",
  schedule: "",
  milestones: "",
};

function formatDate(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isDueToday(task: Task): boolean {
  if (!task.dueDate || task.status === "done") return false;
  const due = new Date(task.dueDate);
  if (Number.isNaN(due.getTime())) return false;

  const now = new Date();
  return (
    due.getFullYear() === now.getFullYear() &&
    due.getMonth() === now.getMonth() &&
    due.getDate() === now.getDate()
  );
}

function isArchived(task: Task): boolean {
  if (task.status !== "done") return false;
  const updated = new Date(task.updatedAt);
  if (Number.isNaN(updated.getTime())) return false;

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return updated < sevenDaysAgo;
}

export default function TaskCenterPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "archived">("all");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TaskType | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("dueDate");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Check URL query param for filter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("filter") === "archived") {
      setFilter("archived");
    }
  }, []);

  const refreshTasks = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/sqlite/tasks", { cache: "no-store" });
      const json = (await res.json()) as Task[] | { error?: string };

      if (!res.ok) {
        const message = "error" in json && json.error ? json.error : "Failed to load tasks.";
        throw new Error(message);
      }

      setTasks(Array.isArray(json) ? json : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshTasks();
  }, [refreshTasks]);

  const grouped = useMemo(
    () => {
      const activeTasks = tasks.filter((task) => !isArchived(task));
      const archivedTasks = tasks.filter((task) => isArchived(task));
      
      if (filter === "archived") {
        return {
          recurring: [],
          oneOff: [],
          goal: [],
          archived: archivedTasks,
        };
      }
      
      return {
        recurring: activeTasks.filter((task) => task.type === "recurring"),
        oneOff: activeTasks.filter((task) => task.type === "one-off"),
        goal: activeTasks.filter((task) => task.type === "goal"),
        archived: archivedTasks,
      };
    },
    [tasks, filter]
  );

  const isFilterActive = search.trim() !== "" || typeFilter !== "all" || sortKey !== "dueDate" || sortDir !== "asc";

  const applyFilters = useCallback((list: Task[]): Task[] => {
    let result = list;

    // Type/project filter
    if (typeFilter !== "all") {
      result = result.filter((t) => t.type === typeFilter);
    }

    // Search filter (title + details)
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.details && t.details.toLowerCase().includes(q))
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "dueDate") {
        const aD = a.dueDate ?? "9999";
        const bD = b.dueDate ?? "9999";
        cmp = aD.localeCompare(bD);
      } else if (sortKey === "createdAt") {
        cmp = a.createdAt.localeCompare(b.createdAt);
      } else if (sortKey === "type") {
        cmp = a.type.localeCompare(b.type);
      } else if (sortKey === "priority") {
        cmp = priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [search, typeFilter, sortKey, sortDir]);

  const filteredGrouped = useMemo(() => ({
    recurring: applyFilters(grouped.recurring),
    oneOff: applyFilters(grouped.oneOff),
    goal: applyFilters(grouped.goal),
    archived: applyFilters(grouped.archived),
  }), [grouped, applyFilters]);

  const totalFiltered = useMemo(
    () =>
      filteredGrouped.recurring.length +
      filteredGrouped.oneOff.length +
      filteredGrouped.goal.length +
      (filter === "archived" ? filteredGrouped.archived.length : 0),
    [filteredGrouped, filter]
  );

  const totalAll = useMemo(
    () =>
      grouped.recurring.length +
      grouped.oneOff.length +
      grouped.goal.length +
      (filter === "archived" ? grouped.archived.length : 0),
    [grouped, filter]
  );

  const priorityOverview = useMemo(
    () => ({
      critical: tasks.filter((task) => task.status !== "done" && task.priority === "critical").length,
      high: tasks.filter((task) => task.status !== "done" && task.priority === "high").length,
      low: tasks.filter((task) => task.status !== "done" && task.priority === "low").length,
    }),
    [tasks]
  );

  const stats = useMemo(() => {
    const open = tasks.filter((task) => task.status !== "done").length;
    const dueToday = tasks.filter((task) => isDueToday(task)).length;
    const goalsOpen = tasks.filter((task) => task.type === "goal" && task.status !== "done").length;
    return { open, dueToday, goalsOpen };
  }, [tasks]);

  const handleCreateTask = async () => {
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    setSaving(true);
    setError(null);

    const payload: TaskPayload = {
      title: form.title.trim(),
      details: form.details.trim(),
      type: form.type,
      priority: form.priority,
      dueDate: form.type === "recurring" ? null : form.dueDate || null,
      schedule: form.type === "recurring" ? form.schedule.trim() || null : null,
      milestones:
        form.type === "goal"
          ? form.milestones
              .split("\n")
              .map((entry) => entry.trim())
              .filter((entry) => entry.length > 0)
          : [],
    };

    try {
      const res = await fetch("/api/sqlite/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as any;

      if (!res.ok) {
        const message = json?.error ? String(json.error) : "Could not create task.";
        throw new Error(message);
      }

      setForm(initialForm);
      await refreshTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create task.");
    } finally {
      setSaving(false);
    }
  };

  const updateTask = async (taskId: string, patch: TaskPayload) => {
    try {
      setError(null);
      const res = await fetch(`/api/sqlite/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });

      const json = (await res.json()) as any;
      if (!res.ok) {
        const message = json?.error ? String(json.error) : "Could not update task.";
        throw new Error(message);
      }

      await refreshTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update task.");
    }
  };

  const removeTask = async (taskId: string) => {
    try {
      setError(null);
      const res = await fetch(`/api/sqlite/tasks/${taskId}`, { method: "DELETE" });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? "Could not delete task.");
      }

      await refreshTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete task.");
    }
  };

  const quickEditTask = async (task: Task) => {
    const title = window.prompt("Edit title", task.title);
    if (title === null) return;

    const details = window.prompt("Edit details", task.details ?? "");
    if (details === null) return;

    const dueDateInput = window.prompt(
      "Due date (YYYY-MM-DD). Leave empty to clear.",
      task.dueDate ? task.dueDate.slice(0, 10) : ""
    );
    if (dueDateInput === null) return;

    const priorityInput = window.prompt("Priority: critical, high, or low", task.priority);
    if (priorityInput === null) return;

    const nextPriority = priorityInput.trim().toLowerCase();
    if (!(["critical", "high", "low"] as string[]).includes(nextPriority)) {
      setError("Priority must be critical, high, or low.");
      return;
    }

    const normalizedDueDate = dueDateInput.trim();
    if (normalizedDueDate && !/^\d{4}-\d{2}-\d{2}$/.test(normalizedDueDate)) {
      setError("Due date must be YYYY-MM-DD.");
      return;
    }

    await updateTask(task.id, {
      title: title.trim(),
      details: details.trim(),
      dueDate: normalizedDueDate || null,
      priority: nextPriority as TaskPriority,
    });
  };

  const renderTaskList = (title: string, list: Task[]) => (
    <section className="surface p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-black">{title}</h3>
        <span className="text-xs text-black/45">{list.length} tasks</span>
      </div>

      {list.length === 0 ? (
        <p className="mt-3 text-sm text-black/50">No tasks in this lane.</p>
      ) : (
        <div className="mt-3 space-y-3">
          {list.map((task) => (
            <div key={task.id} className="rounded-xl border border-black/10 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-black">{task.title}</p>
                  <p className="mt-1 text-xs text-black/45">
                    {typeLabels[task.type]} · updated {formatDate(task.updatedAt)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass[task.status]}`}>
                    {statusLabels[task.status]}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityBadgeClass[task.priority]}`}>
                    {priorityLabels[task.priority]}
                  </span>
                </div>
              </div>

              {task.details ? <p className="mt-2 text-sm text-black/70">{task.details}</p> : null}

              <div className="mt-3 grid gap-2 text-xs text-black/60 md:grid-cols-2">
                <p>Due: {task.dueDate ? formatDate(task.dueDate) : "-"}</p>
                <p>Schedule: {task.schedule ?? "-"}</p>
                <p>Last run: {task.lastRunAt ? formatDate(task.lastRunAt) : "-"}</p>
                <p>Run status: {task.lastRunStatus ?? "-"}</p>
              </div>

              {task.milestones.length > 0 ? (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-black/70">
                  {task.milestones.map((milestone) => (
                    <li key={milestone}>{milestone}</li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {(["todo", "in_progress", "done", "blocked"] as TaskStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => void updateTask(task.id, { status })}
                    className={`rounded-lg border px-2.5 py-1 text-xs transition ${
                      task.status === status
                        ? "border-black bg-black text-white"
                        : "border-black/10 bg-white text-black/70 hover:border-black/25"
                    }`}
                  >
                    {statusLabels[status]}
                  </button>
                ))}

                <button
                  onClick={() => void quickEditTask(task)}
                  className="ml-auto rounded-lg border border-black/15 bg-white px-2.5 py-1 text-xs text-black/70 transition hover:border-black/30"
                >
                  Edit
                </button>

                <button
                  onClick={() => void removeTask(task.id)}
                  className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs text-rose-700 transition hover:bg-rose-100"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div className="space-y-4">
      <div>
        <p className="kicker">Tool</p>
        <h2 className="title-xl mt-1">Task Center</h2>
        <p className="mt-2 max-w-3xl text-sm text-black/65">
          Track recurring routines, one-off tasks for today, and long-term goals in one place.
        </p>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="surface p-4">
          <p className="kicker">Open tasks</p>
          <p className="mt-2 text-2xl font-semibold text-black">{stats.open}</p>
        </div>
        <div className="surface p-4">
          <p className="kicker">Due today</p>
          <p className="mt-2 text-2xl font-semibold text-black">{stats.dueToday}</p>
        </div>
        <div className="surface p-4">
          <p className="kicker">Open goals</p>
          <p className="mt-2 text-2xl font-semibold text-black">{stats.goalsOpen}</p>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="surface p-4">
          <p className="kicker">Critical</p>
          <p className="mt-2 text-2xl font-semibold text-rose-700">{priorityOverview.critical}</p>
        </div>
        <div className="surface p-4">
          <p className="kicker">High</p>
          <p className="mt-2 text-2xl font-semibold text-amber-700">{priorityOverview.high}</p>
        </div>
        <div className="surface p-4">
          <p className="kicker">Low</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-700">{priorityOverview.low}</p>
        </div>
      </section>

      <section className="surface p-5">
        <h3 className="text-base font-semibold text-black">New task</h3>
        <p className="mt-1 text-sm text-black/60">
          Use recurring for daily routines, one-off for today, and goal for long-term outcomes.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            className="input md:col-span-2"
            placeholder="Task title"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          />

          <select
            className="input"
            value={form.type}
            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as TaskType }))}
          >
            <option value="recurring">Recurring</option>
            <option value="one-off">One-off</option>
            <option value="goal">Long-term goal</option>
          </select>

          <select
            className="input"
            value={form.priority}
            onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value as TaskPriority }))}
          >
            <option value="critical">Critical priority</option>
            <option value="high">High priority</option>
            <option value="low">Low priority</option>
          </select>

          {form.type === "recurring" ? (
            <input
              className="input md:col-span-2"
              placeholder="Schedule (example: 0 6 * * * Europe/Zurich)"
              value={form.schedule}
              onChange={(e) => setForm((prev) => ({ ...prev, schedule: e.target.value }))}
            />
          ) : (
            <input
              className="input md:col-span-2"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
            />
          )}

          {form.type === "goal" ? (
            <textarea
              className="input min-h-24 md:col-span-2"
              placeholder="Milestones (one per line)"
              value={form.milestones}
              onChange={(e) => setForm((prev) => ({ ...prev, milestones: e.target.value }))}
            />
          ) : null}

          <textarea
            className="input min-h-24 md:col-span-2"
            placeholder="Optional details"
            value={form.details}
            onChange={(e) => setForm((prev) => ({ ...prev, details: e.target.value }))}
          />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button className="btn-primary" onClick={() => void handleCreateTask()} disabled={saving}>
            {saving ? "Saving..." : "Add task"}
          </button>
          <button
            onClick={() => setForm(initialForm)}
            className="rounded-xl border border-black/10 px-4 py-2 text-sm text-black/70"
          >
            Reset
          </button>
          <button
            onClick={() => void refreshTasks()}
            className="rounded-xl border border-black/10 px-4 py-2 text-sm text-black/70"
          >
            Refresh
          </button>
        </div>

        {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
      </section>

      {loading ? (
        <p className="text-sm text-black/55">Loading tasks...</p>
      ) : (
        <>
          {/* Filter / Sort Bar */}
          <section className="surface p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative flex-1 min-w-48">
                <input
                  className="input pl-8 w-full"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-black/35 text-sm">🔍</span>
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black/35 hover:text-black/70"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Project / Type filter */}
              <div className="flex items-center gap-1">
                {(["all", "recurring", "one-off", "goal"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                      typeFilter === t
                        ? "border-black bg-black text-white"
                        : "border-black/10 bg-white text-black/60 hover:border-black/25"
                    }`}
                  >
                    {t === "all" ? "All types" : typeLabels[t]}
                  </button>
                ))}
              </div>

              {/* Sort controls */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-black/40">Sort:</span>
                <select
                  className="input py-1.5 text-xs"
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                >
                  <option value="dueDate">Due date</option>
                  <option value="createdAt">Created</option>
                  <option value="type">Type</option>
                  <option value="priority">Priority</option>
                </select>
                <button
                  onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                  className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-xs text-black/60 hover:border-black/25"
                  title={sortDir === "asc" ? "Ascending" : "Descending"}
                >
                  {sortDir === "asc" ? "↑" : "↓"}
                </button>

                {/* Clear filters */}
                {isFilterActive && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setTypeFilter("all");
                      setSortKey("dueDate");
                      setSortDir("asc");
                    }}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs text-rose-700 hover:bg-rose-100 transition"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* Task count */}
            {isFilterActive && (
              <p className="text-xs text-black/50">
                Showing <span className="font-medium text-black/70">{totalFiltered}</span> of{" "}
                <span className="font-medium text-black/70">{totalAll}</span> tasks
              </p>
            )}
          </section>

          <div className="grid gap-4">
          {filter === "archived" && (
            <button
              onClick={() => setFilter("all")}
              className="self-start mb-2 rounded-xl border border-black/10 px-4 py-2 text-sm text-black/70 hover:bg-black/5"
            >
              ← Back to Active Tasks
            </button>
          )}
          {renderTaskList("Recurring", filteredGrouped.recurring)}
          {renderTaskList("One-off", filteredGrouped.oneOff)}
          {renderTaskList("Long-term goals", filteredGrouped.goal)}
          {filter === "all" && grouped.archived.length > 0 && (
            <button
              onClick={() => setFilter("archived")}
              className="surface p-4 text-center hover:bg-zinc-50 transition cursor-pointer"
            >
              <span className="text-sm text-zinc-500">View {grouped.archived.length} archived tasks →</span>
            </button>
          )}
          {filter === "archived" && renderTaskList("Archived (done > 7 days)", filteredGrouped.archived)}
        </div>
        </>
      )}
    </div>
  );
}
