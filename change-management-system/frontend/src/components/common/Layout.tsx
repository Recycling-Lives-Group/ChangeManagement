import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  User,
  Bell,
  Menu,
  X,
  Eye,
  BarChart3,
  Calendar,
  Calculator,
  ThumbsUp,
  Zap,
  GitBranch
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'Admin' || user?.role === 'CAB_Member' || user?.role === 'Coordinator' || user?.role === 'cab_member' || user?.role === 'manager';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed w-full z-30 top-0">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <Link to="/" className="flex ml-2 md:mr-24">
                <FileText className="h-8 w-8 text-primary-600" />
                <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap ml-2">
                  RLS Change Management App
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <Bell size={20} />
              </button>
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
                <button className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <User size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-20 w-64 h-screen pt-20 transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-white border-r border-gray-200 lg:translate-x-0 dark:bg-gray-800 dark:border-gray-700`}
      >
        <div className="h-full px-3 pb-4 overflow-y-auto">
          <ul className="space-y-2 font-medium">
            <li>
              <Link
                to="/"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <LayoutDashboard size={20} />
                <span className="ml-3">User Dashboard</span>
              </Link>
            </li>
{isAdmin && (
              <>
                <li>
                  <Link
                    to="/admin"
                    className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Settings size={20} />
                    <span className="ml-3">CAB Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cab-review"
                    className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Eye size={20} />
                    <span className="ml-3">CAB Review</span>
                  </Link>
                </li>
              </>
            )}
            <li>
              <Link
                to="/calendar"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Calendar size={20} />
                <span className="ml-3">Change Calendar</span>
              </Link>
            </li>
            <li>
              <Link
                to="/changes/new"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FileText size={20} />
                <span className="ml-3">New Change Request</span>
              </Link>
            </li>

            {/* Phase 2 Features */}
            <li className="pt-4 mt-4 space-y-2 border-t border-gray-200 dark:border-gray-700">
              <div className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Phase 2 Features
              </div>
            </li>
            <li>
              <Link
                to="/metrics"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <BarChart3 size={20} />
                <span className="ml-3">Metrics Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/effort-assessment"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Calculator size={20} />
                <span className="ml-3">Effort Assessment</span>
              </Link>
            </li>
            <li>
              <Link
                to="/benefit-assessment"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Zap size={20} />
                <span className="ml-3">Benefit Assessment</span>
              </Link>
            </li>
            <li>
              <Link
                to="/dependencies"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <GitBranch size={20} />
                <span className="ml-3">Dependency Graph</span>
              </Link>
            </li>

            {/* Admin Section */}
            {user?.role === 'admin' && (
              <>
                <li className="pt-4 mt-4 space-y-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Admin
                  </div>
                </li>
                <li>
                  <Link
                    to="/benefit-scoring-config"
                    className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Settings size={20} />
                    <span className="ml-3">Benefit Scoring Config</span>
                  </Link>
                </li>
              </>
            )}

            <li className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleLogout}
                className="flex items-center p-2 w-full text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <LogOut size={20} />
                <span className="ml-3">Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64 mt-14">
        {children}
      </div>
    </div>
  );
}
