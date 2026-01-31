"use client";

import { useEffect, useState } from "react";
import { Bell, AlertTriangle, Clock, User, CheckCircle } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  type: "overdue" | "due_soon" | "assigned";
  priority: "HIGH" | "MEDIUM" | "LOW";
  project: string;
  projectSlug: string;
  taskId: number;
  task: string;
  dueDate?: string;
  assignee?: string;
  message: string;
  daysOverdue?: number;
  daysUntilDue?: number;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [summary, setSummary] = useState({ overdue: 0, dueSoon: 0, assigned: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications?upcoming=true");
      const data = await res.json();
      setNotifications(data.notifications || []);
      setSummary(data.summary || { overdue: 0, dueSoon: 0, assigned: 0 });
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "bg-red-900/30 border-red-700 text-red-300";
      case "MEDIUM": return "bg-yellow-900/30 border-yellow-700 text-yellow-300";
      case "LOW": return "bg-blue-900/30 border-blue-700 text-blue-300";
      default: return "bg-gray-800 border-gray-700 text-gray-300";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "overdue": return <AlertTriangle size={20} className="text-red-400" />;
      case "due_soon": return <Clock size={20} className="text-yellow-400" />;
      case "assigned": return <User size={20} className="text-blue-400" />;
      default: return <Bell size={20} className="text-gray-400" />;
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3">
              <Bell size={32} />
              Notifications
            </h1>
            <p className="text-gray-400 mt-1">Stay on top of your tasks and deadlines</p>
          </div>
          <Link href="/" className="text-gray-400 hover:text-white transition">
            ← Back to Dashboard
          </Link>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle size={20} className="text-red-400" />
              <p className="text-gray-400 text-sm">Overdue</p>
            </div>
            <p className="text-3xl font-bold text-red-400">{summary.overdue}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Clock size={20} className="text-yellow-400" />
              <p className="text-gray-400 text-sm">Due Soon</p>
            </div>
            <p className="text-3xl font-bold text-yellow-400">{summary.dueSoon}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <User size={20} className="text-blue-400" />
              <p className="text-gray-400 text-sm">Assigned to You</p>
            </div>
            <p className="text-3xl font-bold text-blue-400">{summary.assigned}</p>
          </div>
        </div>

        {/* Notification List */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">All Notifications</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <Bell size={32} className="mx-auto mb-2 animate-pulse" />
              <p>Loading notifications...</p>
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-slate-700">
              {notifications.map(notification => (
                <Link
                  key={notification.id}
                  href={`/projects/${notification.projectSlug}`}
                  className={`block p-4 hover:bg-slate-700/50 transition ${getPriorityColor(notification.priority)}`}
                >
                  <div className="flex items-start gap-4">
                    {getTypeIcon(notification.type)}
                    <div className="flex-1">
                      <p className="text-white">{notification.message}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-400">
                        <span>{notification.project}</span>
                        {notification.dueDate && <span>Due: {notification.dueDate}</span>}
                        {notification.daysOverdue !== undefined && (
                          <span className="text-red-400">{notification.daysOverdue} days overdue</span>
                        )}
                        {notification.daysUntilDue !== undefined && (
                          <span className="text-yellow-400">{notification.daysUntilDue} days left</span>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(notification.priority)}`}>
                      {notification.priority}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <CheckCircle size={48} className="mx-auto mb-4 text-green-400" />
              <p>All caught up!</p>
              <p className="text-sm mt-2">No pending notifications</p>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Notification Tips</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>• Tasks are flagged as overdue if past their due date</li>
            <li>• You'll see reminders 7 days before a task is due</li>
            <li>• All assigned tasks appear in your notifications</li>
            <li>• Check the Calendar view for a visual timeline</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
