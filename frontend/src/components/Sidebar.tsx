import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  PenSquare,
  CheckCircle,
  ClipboardList,
  BarChart3,
  Bot,
  Compass,
  X,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/reviews', label: 'Reviews', icon: MessageSquare },
  { to: '/submit', label: 'Submit Review', icon: PenSquare },
  { to: '/approvals', label: 'Approval Queue', icon: CheckCircle },
  { to: '/tasks', label: 'Task Board', icon: ClipboardList },
  { to: '/insights', label: 'Insights', icon: BarChart3 },
  { to: '/agents', label: 'Agent Status', icon: Bot },
];

interface SidebarProps {
  onClose: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
            <Compass className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">
            ReviewPilot
          </span>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600/90 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
              }`
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-700/50 px-5 py-4">
        <p className="text-xs text-slate-500">© 2024 ReviewPilot</p>
        <p className="text-xs text-slate-500">AI-Powered Review Management</p>
      </div>
    </div>
  );
}
