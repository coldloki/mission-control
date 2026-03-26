"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type SqliteStats = {
  lastSync?: string;
  taskCount?: number;
  counts?: Record<string, number>;
};

export default function MissionControlHome() {
  const [stats, setStats] = useState<SqliteStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadStats();
  }, []);

  async function loadStats() {
    try {
      const res = await fetch("/api/sqlite/stats", { cache: "no-store" });
      if (!res.ok) throw new Error(`GET /api/sqlite/stats failed (${res.status})`);
      const data = (await res.json()) as SqliteStats;
      setStats(data);
    } catch (err) {
      console.error(err);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }

  const computed = useMemo(() => {
    const total = stats?.taskCount ?? 0;
    const counts = stats?.counts ?? {};
    const done = Number(counts.done || 0);
    const inProgress = Number(counts.in_progress || 0);
    const todo = Number(counts.todo || 0);
    const blocked = Number(counts.blocked || 0) + Number(counts.cancelled || 0);
    return { total, done, inProgress, todo, blocked };
  }, [stats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 -mx-5 -my-8 md:-mx-6">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📋 Mission Control</h1>
              <p className="text-sm text-gray-500 mt-1">Summary</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/tools/task-center"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Open Task Center
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <div className="text-2xl font-bold text-gray-900">{computed.total}</div>
            <div className="text-sm text-gray-500">Total Tasks</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <div className="text-2xl font-bold text-emerald-600">{computed.done}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <div className="text-2xl font-bold text-blue-600">{computed.inProgress}</div>
            <div className="text-sm text-gray-500">In Progress</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <div className="text-2xl font-bold text-gray-600">{computed.todo}</div>
            <div className="text-sm text-gray-500">To Do</div>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 text-lg">✅</span>
              <div>
                <div className="text-sm font-semibold text-emerald-900">Data Source Active</div>
                <div className="text-xs text-emerald-700">Connected to local SQLite database</div>
              </div>
            </div>
          </div>
          {computed.blocked ? (
            <div className="mt-3 text-xs font-semibold text-rose-600 bg-rose-100 inline-block px-2 py-1 rounded">
              Blocked Tasks: {computed.blocked}
            </div>
          ) : null}
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          <p className="mt-2 text-sm text-gray-600">
            Task editing mapping is complete. JSON legacy storage is deprecated.
          </p>
          <div className="mt-5">
            <Link href="/tools/task-center" className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition">
              Go to Task Center <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}