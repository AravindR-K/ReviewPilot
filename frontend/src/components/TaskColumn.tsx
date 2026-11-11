import type { Task } from '../api/types';
import { CheckCircle, Clock, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface TaskColumnProps {
  team: string;
  tasks: Task[];
  onUpdateStatus: (id: string, status: string) => void;
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    normal: 'bg-gray-100 text-gray-600',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700 animate-pulse',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${styles[priority] || styles.normal}`}
    >
      {priority}
    </span>
  );
}

function TaskStatusIcon({ status }: { status: string }) {
  if (status === 'done')
    return <CheckCircle className="h-4 w-4 text-emerald-500" />;
  if (status === 'in_progress')
    return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
  return <Clock className="h-4 w-4 text-gray-400" />;
}

const teamColors: Record<string, string> = {
  Kitchen: 'border-t-orange-500',
  Delivery: 'border-t-blue-500',
  Packaging: 'border-t-purple-500',
  Management: 'border-t-emerald-500',
};

export default function TaskColumn({
  team,
  tasks,
  onUpdateStatus,
}: TaskColumnProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const borderColor = teamColors[team] || 'border-t-gray-500';

  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white shadow-sm border-t-4 ${borderColor}`}
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h3 className="font-semibold text-gray-900">{team}</h3>
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
          {tasks.length}
        </span>
      </div>

      <div className="divide-y divide-gray-100">
        {tasks.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            No tasks
          </div>
        )}
        {tasks.map((task) => {
          const isExpanded = expandedId === task.id;
          return (
            <div key={task.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  <TaskStatusIcon status={task.status} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {task.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <PriorityBadge priority={task.priority} />
                      <span className="text-xs text-gray-400 capitalize">
                        {task.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : task.id)
                  }
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>

              {isExpanded && (
                <div className="mt-3 space-y-3">
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                    {task.description}
                  </p>
                  <div className="flex gap-2">
                    {task.status !== 'done' && (
                      <button
                        onClick={() => onUpdateStatus(task.id, 'done')}
                        className="flex-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
                      >
                        ✅ Mark Done
                      </button>
                    )}
                    {task.status === 'open' && (
                      <button
                        onClick={() =>
                          onUpdateStatus(task.id, 'in_progress')
                        }
                        className="flex-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                      >
                        🚀 Start
                      </button>
                    )}
                    {task.status === 'done' && (
                      <span className="flex-1 text-center text-xs text-emerald-600 font-medium py-1.5">
                        ✅ Completed
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
