"use client";

import { useEffect, useState } from "react";
import { getActivityLog, getActivityColor, getActivityIcon, Activity } from "@/lib/projects";
import Link from "next/link";
import { Activity as ActivityIcon, Clock, User } from "lucide-react";

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    setActivities(getActivityLog(100));
  }, []);

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      
      if (minutes < 1) return "Just now";
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
      return date.toLocaleDateString();
    } catch {
      return "Unknown";
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3">
              <ActivityIcon size={32} />
              Activity Log
            </h1>
            <p className="text-gray-400 mt-1">Track all project activity and changes</p>
          </div>
          <Link href="/" className="text-gray-400 hover:text-white transition">
            ← Back to Dashboard
          </Link>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Total Activities</p>
            <p className="text-2xl font-bold text-white">{activities.length}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Tasks Created</p>
            <p className="text-2xl font-bold text-blue-400">
              {activities.filter(a => a.type === "task_created").length}
            </p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Tasks Completed</p>
            <p className="text-2xl font-bold text-green-400">
              {activities.filter(a => a.type === "task_completed").length}
            </p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Projects Created</p>
            <p className="text-2xl font-bold text-purple-400">
              {activities.filter(a => a.type === "project_created").length}
            </p>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          </div>
          
          {activities.length > 0 ? (
            <div className="divide-y divide-slate-700">
              {activities.map(activity => (
                <div key={activity.id} className="p-4 hover:bg-slate-700/50 transition">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold border ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-white">{activity.description}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {formatTime(activity.timestamp)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User size={14} />
                          {activity.user}
                        </span>
                        {activity.projectName && (
                          <Link 
                            href={`/projects/${activity.projectSlug}`}
                            className="text-cyan-400 hover:underline"
                          >
                            {activity.projectName}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <ActivityIcon size={48} className="mx-auto mb-4 opacity-50" />
              <p>No activity recorded yet</p>
              <p className="text-sm mt-2">Start creating tasks to see activity here</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
