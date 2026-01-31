"use client";

import { useEffect, useState } from "react";
import { Bell, AlertTriangle, Clock, User, Check, X } from "lucide-react";
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

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [summary, setSummary] = useState({ overdue: 0, dueSoon: 0, assigned: 0 });

  useEffect(() => {
    fetchNotifications();
    // Poll every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications?upcoming=true");
      const data = await res.json();
      setNotifications(data.notifications || []);
      setSummary(data.summary || { overdue: 0, dueSoon: 0, assigned: 0 });
    } catch {
      // Silently fail
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "border-l-red-500 bg-red-900/20";
      case "MEDIUM": return "border-l-yellow-500 bg-yellow-900/20";
      case "LOW": return "border-l-blue-500 bg-blue-900/20";
      default: return "border-l-gray-500 bg-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "overdue": return <AlertTriangle size={16} className="text-red-400" />;
      case "due_soon": return <Clock size={16} className="text-yellow-400" />;
      case "assigned": return <User size={16} className="text-blue-400" />;
      default: return <Bell size={16} className="text-gray-400" />;
    }
  };

  const totalCount = notifications.length;

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
      >
        <Bell size={20} className="text-gray-300" />
        {totalCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {totalCount > 9 ? "9+" : totalCount}
          </span>
        )}
      </button>

      {showPanel && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowPanel(false)} />
          <div className="absolute right-0 top-12 w-96 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
              <h3 className="font-semibold text-white">Notifications</h3>
              <div className="flex gap-2 text-xs">
                {summary.overdue > 0 && (
                  <span className="bg-red-900/50 text-red-300 px-2 py-0.5 rounded">
                    {summary.overdue} overdue
                  </span>
                )}
                {summary.dueSoon > 0 && (
                  <span className="bg-yellow-900/50 text-yellow-300 px-2 py-0.5 rounded">
                    {summary.dueSoon} due soon
                  </span>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="divide-y divide-slate-700">
                  {notifications.slice(0, 10).map(notification => (
                    <Link
                      key={notification.id}
                      href={`/projects/${notification.projectSlug}`}
                      onClick={() => setShowPanel(false)}
                      className={`block p-4 border-l-4 hover:bg-slate-700/50 transition ${getPriorityColor(notification.priority)}`}
                    >
                      <div className="flex items-start gap-3">
                        {getTypeIcon(notification.type)}
                        <div className="flex-1">
                          <p className="text-sm text-white">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.project} • {notification.dueDate || "No due date"}
                          </p>
                          {notification.daysOverdue !== undefined && (
                            <p className="text-xs text-red-400 mt-1">
                              {notification.daysOverdue} day(s) overdue
                            </p>
                          )}
                          {notification.daysUntilDue !== undefined && (
                            <p className="text-xs text-yellow-400 mt-1">
                              Due in {notification.daysUntilDue} days
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Bell size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                  <p className="text-xs mt-1">All caught up!</p>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-700 text-center">
              <Link 
                href="/notifications" 
                onClick={() => setShowPanel(false)}
                className="text-sm text-cyan-400 hover:underline"
              >
                View all notifications
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
