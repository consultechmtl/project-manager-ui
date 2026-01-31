"use client";

import { useEffect, useState } from "react";
import { getProjects, getPriorityBadge, getTagColor } from "@/lib/projects";
import { Folder, CheckCircle, Clock, Plus, User, Calendar, Tag } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [projects, setProjects] = useState<ReturnType<typeof getProjects>>([]);
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const activeProjects = projects.filter(p => p.status === "active");
  const completedProjects = projects.filter(p => p.status === "completed");

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-cyan-400">Project Manager</h1>
          <Link 
            href="/new"
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-lg transition"
          >
            <Plus size={18} />
            New Project
          </Link>
        </header>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              activeTab === "active" ? "bg-cyan-900/50 text-cyan-300" : "text-gray-400"
            }`}
          >
            <Folder size={18} />
            Active ({activeProjects.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              activeTab === "completed" ? "bg-green-900/50 text-green-300" : "text-gray-400"
            }`}
          >
            <CheckCircle size={18} />
            Completed ({completedProjects.length})
          </button>
        </div>

        <div className="grid gap-4">
          {(activeTab === "active" ? activeProjects : completedProjects).map((project) => (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className="block bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-cyan-700 transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">{project.name}</h2>
                  <p className="text-gray-400 mt-1">{project.description}</p>
                </div>
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock size={14} />
                  {project.tasks.filter(t => !t.completed).length} pending
                </span>
              </div>
              
              {/* Task preview */}
              {project.tasks.filter(t => !t.completed).length > 0 && (
                <div className="space-y-2 mt-4">
                  {project.tasks
                    .filter(t => !t.completed)
                    .slice(0, 2)
                    .map(task => (
                      <div key={task.id} className="flex items-center gap-2 text-sm">
                        <span className={getPriorityBadge(task.priority)}>{task.priority}</span>
                        <span className="text-gray-300">{task.text}</span>
                        {task.assigned && task.assigned !== "UNASSIGNED" && (
                          <span className="flex items-center gap-1 text-gray-500 text-xs">
                            <User size={10} />
                            {task.assigned}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="flex items-center gap-1 text-orange-400 text-xs">
                            <Calendar size={10} />
                            {task.dueDate}
                          </span>
                        )}
                        {task.tags?.slice(0, 2).map(tag => (
                          <span key={tag} className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${getTagColor(tag)}`}>
                            <Tag size={8} />
                          </span>
                        ))}
                      </div>
                    ))}
                  {project.tasks.filter(t => !t.completed).length > 2 && (
                    <p className="text-gray-500 text-sm">+ {project.tasks.filter(t => !t.completed).length - 2} more tasks</p>
                  )}
                </div>
              )}
            </Link>
          ))}

          {(activeTab === "active" ? activeProjects : completedProjects).length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Folder size={48} className="mx-auto mb-4 opacity-50" />
              <p>No {activeTab} projects</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
