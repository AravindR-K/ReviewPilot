import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import type { AgentStatus } from '../api/types';
import { Bot, Play, Pause, RefreshCw, AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react';

const AGENT_INFO: Record<string, { name: string; description: string; icon: string; color: string }> = {
  collector: {
    name: 'Collector',
    description: 'Picks up new reviews, removes duplicates and spam, detects language',
    icon: '📥',
    color: 'bg-blue-500',
  },
  analyzer: {
    name: 'Analyzer',
    description: 'Sets sentiment, topics, and urgency using Claude Haiku',
    icon: '🔍',
    color: 'bg-purple-500',
  },
  responder: {
    name: 'Responder',
    description: 'Drafts personalized replies in the customer\'s language using Claude Sonnet',
    icon: '✍️',
    color: 'bg-emerald-500',
  },
  action: {
    name: 'Action',
    description: 'Creates tasks for the right team from complaints',
    icon: '⚡',
    color: 'bg-orange-500',
  },
  insights: {
    name: 'Insights',
    description: 'Generates weekly reports with trends and recommendations',
    icon: '📊',
    color: 'bg-indigo-500',
  },
};

function timeAgo(date: string | null | undefined): string {
  if (!date) return 'Never';
  const diff = Date.now() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AgentStatusPage() {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [runningAll, setRunningAll] = useState(false);

  const fetchAgents = useCallback(async () => {
    try {
      const data = await api.getAgents();
      setAgents(data);
    } catch (err) {
      console.error('Failed to fetch agents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 5000);
    return () => clearInterval(interval);
  }, [fetchAgents]);

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    try {
      const updated = await api.toggleAgent(id);
      setAgents((prev) =>
        prev.map((a) => (a.id === id ? updated : a))
      );
    } catch (err) {
      console.error('Toggle failed:', err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleRunAll = async () => {
    setRunningAll(true);
    try {
      await api.runAllAgents();
      setTimeout(fetchAgents, 2000);
    } catch (err) {
      console.error('Run all failed:', err);
    } finally {
      setRunningAll(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Agent Status</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor and control the 5 independent AI agents
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAgents}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={handleRunAll}
            disabled={runningAll}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {runningAll ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Running...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Run All Agents
              </>
            )}
          </button>
        </div>
      </div>

      {/* Pipeline visualization */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Agent Pipeline
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {['collector', 'analyzer', 'responder', 'action'].map((id, i) => {
            const agent = agents.find((a) => a.id === id);
            const info = AGENT_INFO[id];
            return (
              <div key={id} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                    agent?.isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}
                >
                  <span>{info.icon}</span>
                  {info.name}
                  {agent?.isActive ? (
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Pause className="h-3.5 w-3.5 text-gray-400" />
                  )}
                </div>
                {i < 3 && (
                  <svg className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Agent cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent) => {
          const info = AGENT_INFO[agent.id] || {
            name: agent.id,
            description: '',
            icon: '🤖',
            color: 'bg-gray-500',
          };
          return (
            <div
              key={agent.id}
              className={`rounded-xl border bg-white p-6 shadow-sm transition-all ${
                agent.isActive ? 'border-gray-200' : 'border-gray-200 opacity-75'
              }`}
            >
              {/* Agent header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${info.color} text-lg`}
                  >
                    {info.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{info.name}</h3>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium ${
                        agent.isActive ? 'text-emerald-600' : 'text-gray-400'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          agent.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
                        }`}
                      />
                      {agent.isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(agent.id)}
                  disabled={togglingId === agent.id}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    agent.isActive
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  } disabled:opacity-50`}
                >
                  {togglingId === agent.id ? (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : agent.isActive ? (
                    <Pause className="h-3 w-3" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                  {agent.isActive ? 'Pause' : 'Resume'}
                </button>
              </div>

              {/* Description */}
              <p className="mt-3 text-xs text-gray-500">{info.description}</p>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-gray-50 p-2.5">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    Last Run
                  </div>
                  <p className="mt-0.5 text-sm font-semibold text-gray-700">
                    {timeAgo(agent.lastRunAt)}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-2.5">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Bot className="h-3 w-3" />
                    Processed
                  </div>
                  <p className="mt-0.5 text-sm font-semibold text-gray-700">
                    {agent.processedCount}
                  </p>
                </div>
              </div>

              {/* Error */}
              {agent.lastError && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-rose-50 p-2.5">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-rose-500" />
                  <p className="text-xs text-rose-600 line-clamp-2">{agent.lastError}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
