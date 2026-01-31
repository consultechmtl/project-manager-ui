"use client";

import { useEffect, useState } from "react";
import { getProjects, getPriorityBadge, getTagColor } from "@/lib/projects";
import { Folder, CheckCircle, Clock, Plus, User, Calendar as CalendarIcon, Tag, Search, Activity, BookOpen, Download, Kanban, Table } from "lucide-react";
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
          <div>
            <h1 className="text-3xl font-bold text-cyan-400">Project Manager</h1>
            <p className="text-gray-400 mt-1">AI-powered task management with JARVIS</p>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/table"
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition"
            >
              <Table size={18} />
              Table
            </Link>
            <Link 
              href="/kanban"
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition"
            >
              <Kanban size={18} />
              Kanban
            </Link>
            <Link 
              href="/templates"
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition"
            >
              <BookOpen size={18} />
              Templates
            </Link>
            <Link 
              href="/export"
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition"
            >
              <Download size={18} />
              Export
            </Link>
            <Link 
              href="/activity"
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition"
            >
              <Activity size={18} />
              Activity
            </Link>
            <Link 
              href="/search"
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition"
            >
              <Search size={18} />
              Search
            </Link>
            <Link 
              href="/calendar"
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition"
            >
              <CalendarIcon size={18} />
              Calendar
            </Link>
            <Link 
              href="/new"
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-lg transition"
            >
              <Plus size={18} />
              New
            </Link>
          </div>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Active Projects</p>
            <p className="text-2xl font-bold text-white">{activeProjects.length}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Pending Tasks</p>
            <p className="text-2xl font-bold text-cyan-400">
              {projects.reduce((acc, p) => acc + p.tasks.filter(t => !t.completed).length, 0)}
            </p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Completed Tasks</p>
            <p className="text-2xl font-bold text-green-400">
              {projects.reduce((acc, p) => acc + p.tasks.filter(t => t.completed).length, 0)}
            </p>
          </div>
        </div>

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
              
              {project.tasks.filter(t => !t.completed).slice(0, 3).map(task => (
                <div key={task.id} className="flex items-center gap-2 text-sm mt-2">
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
                      <CalendarIcon size={10} />
                      {task.dueDate}
                    </span>
                  )}
                </div>
              ))}
              {project.tasks.filter(t => !t.completed).length > 3 && (
                <p className="text-gray-500 text-sm mt-2">
                  + {project.tasks.filter(t => !t.completed).length - 3} more tasks
                </p>
              )}
            </Link>
          ))}

          {(activeTab === "active" ? activeProjects : completedProjects).length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Folder size={48} className="mx-auto mb-4 opacity-50" />
              <p>No {activeTab} projects</p>
              <Link href="/new" className="text-cyan-400 hover:underline mt-2 block">
                Create your first project
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
