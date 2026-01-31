"use client";

import { useEffect, useState } from "react";
import { getProjects, getPriorityBadge } from "@/lib/projects";
import { Folder, CheckCircle, Clock, Plus } from "lucide-react";
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
              
              <div className="flex gap-2 flex-wrap">
                {project.tasks
                  .filter(t => !t.completed)
                  .slice(0, 3)
                  .map(task => (
                    <span key={task.id} className={getPriorityBadge(task.priority)}>
                      {task.priority}
                    </span>
                  ))}
                {project.tasks.filter(t => !t.completed).length > 3 && (
                  <span className="text-gray-500 text-sm">+ more</span>
                )}
              </div>
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
