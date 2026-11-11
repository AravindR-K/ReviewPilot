import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import type { Task } from '../api/types';
import { ClipboardList, CheckCircle, Circle, Loader, RefreshCw } from 'lucide-react';

const TEAMS = ['kitchen', 'delivery', 'packaging', 'management'];

const TEAM_COLORS: Record<string, { bg: string; border: string; header: string; icon: string }> = {
  kitchen: { bg: 'bg-orange-50', border: 'border-orange-200', header: 'bg-orange-500', icon: '🍳' },
  delivery: { bg: 'bg-blue-50', border: 'border-blue-200', header: 'bg-blue-500', icon: '🚴' },
  packaging: { bg: 'bg-purple-50', border: 'border-purple-200', header: 'bg-purple-500', icon: '📦' },
  management: { bg: 'bg-teal-50', border: 'border-teal-200', header: 'bg-teal-500', icon: '👔' },
};

const PRIORITY_STYLES: Record<string, string> = {
  urgent: 'bg-rose-100 text-rose-700 animate-pulse',
  high: 'bg-orange-100 text-orange-700',
  normal: 'bg-gray-100 text-gray-600',
};

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const data = await api.getTasks(params);
      setTasks(data.tasks);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await api.updateTask(id, newStatus);
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error('Failed to update task:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const openCount = tasks.filter((t) => t.status === 'open').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;

  const getTeamTasks = (team: string) =>
    tasks.filter((t) => t.team === team);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Board</h1>
          <p className="mt-1 text-sm text-gray-500">
            Action items generated from customer complaints
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchTasks}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 flex flex-wrap gap-3">
        <span className="rounded-full bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-700">
          {openCount} open
        </span>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
          {inProgressCount} in progress
        </span>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
          {doneCount} completed
        </span>
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-2">
        {['all', 'open', 'in_progress', 'done'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === s
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s === 'all' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Kanban columns */}
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white py-16">
          <ClipboardList className="h-12 w-12 text-gray-300" />
          <h2 className="mt-4 text-lg font-semibold text-gray-500">No tasks yet</h2>
          <p className="mt-1 text-sm text-gray-400">Tasks will appear here when complaints are processed</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {TEAMS.map((team) => {
            const teamTasks = getTeamTasks(team);
            const colors = TEAM_COLORS[team];
            return (
              <div
                key={team}
                className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden`}
              >
                {/* Column header */}
                <div className={`${colors.header} px-4 py-3 text-white`}>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-semibold capitalize">
                      <span className="text-lg">{colors.icon}</span>
                      {team}
                    </span>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">
                      {teamTasks.length}
                    </span>
                  </div>
                </div>

                {/* Tasks */}
                <div className="space-y-2 p-3">
                  {teamTasks.length === 0 ? (
                    <p className="py-4 text-center text-xs text-gray-400">No tasks</p>
                  ) : (
                    teamTasks.map((task) => (
                      <div
                        key={task.id}
                        className="rounded-lg border border-white bg-white p-3 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-medium text-gray-900 leading-tight">
                            {task.title}
                          </h3>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                              PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.normal
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        <p className="mt-1.5 text-xs text-gray-500 line-clamp-2">
                          {task.description}
                        </p>

                        {/* Status controls */}
                        <div className="mt-3 flex items-center gap-1">
                          {task.status === 'done' ? (
                            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                              <CheckCircle className="h-3.5 w-3.5" />
                              Done
                            </span>
                          ) : task.status === 'in_progress' ? (
                            <button
                              onClick={() => handleUpdateStatus(task.id, 'done')}
                              disabled={updatingId === task.id}
                              className="flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-200 disabled:opacity-50"
                            >
                              {updatingId === task.id ? (
                                <Loader className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle className="h-3 w-3" />
                              )}
                              Mark Done
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                                disabled={updatingId === task.id}
                                className="flex items-center gap-1 rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-200 disabled:opacity-50"
                              >
                                <Circle className="h-3 w-3" />
                                Start
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(task.id, 'done')}
                                disabled={updatingId === task.id}
                                className="flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-200 disabled:opacity-50"
                              >
                                <CheckCircle className="h-3 w-3" />
                                Done
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
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
