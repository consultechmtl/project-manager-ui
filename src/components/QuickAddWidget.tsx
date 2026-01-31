"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Zap } from "lucide-react";

export default function QuickAddWidget() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [projectSlug, setProjectSlug] = useState("");
  const [taskText, setTaskText] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [projects, setProjects] = useState<{ name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch projects on mount
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("project-manager-settings");
      const settings = stored ? JSON.parse(stored) : null;
      const assignee = settings?.defaultAssignee || "UNASSIGNED";
      const defPriority = settings?.defaultPriority || "MEDIUM";
      
      setPriority(defPriority);
      
      // Fetch projects
      fetch("/api/projects")
        .then(res => res.json())
        .then(data => {
          setProjects(data.projects?.filter((p: any) => p.status === "active").map((p: any) => ({ name: p.name, slug: p.slug })) || []);
          if (data.projects?.length > 0) {
            setProjectSlug(data.projects[0].slug);
          }
        })
        .catch(() => {
          // Fallback to localStorage
          try {
            const fs = require("fs");
            const path = require("path");
            const PROJECTS_DIR = path.join(process.env.HOME || "/home/xecutor", "dev", "projects", "active");
            if (fs.existsSync(PROJECTS_DIR)) {
              const files = fs.readdirSync(PROJECTS_DIR).filter(f => f.endsWith(".md"));
              setProjects(files.map(f => ({ name: f.replace(".md", ""), slug: f.replace(".md", "") })));
              if (files.length > 0) setProjectSlug(files[0].replace(".md", ""));
            }
          } catch {}
        });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText.trim() || !projectSlug) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectSlug}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: taskText,
          priority,
          assigned: "UNASSIGNED",
        }),
      });

      if (response.ok) {
        setTaskText("");
        setIsOpen(false);
        router.refresh();
      }
    } catch {
      alert("Failed to add task");
    } finally {
      setLoading(false);
    }
  };

  // Keyboard shortcut to open quick add
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "q" && !e.ctrlKey && !e.metaKey && e.altKey) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-cyan-600 hover:bg-cyan-500 rounded-full shadow-lg flex items-center justify-center transition transform hover:scale-105"
        title="Quick Add Task (Alt+Q)"
      >
        <Plus size={24} className="text-white" />
      </button>
    );
  }

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" 
        onClick={() => setIsOpen(false)}
      />
      <div className="fixed bottom-6 right-6 z-50 w-96 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
        <div className="p-4 bg-slate-900/50 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-cyan-400" />
            <span className="font-semibold text-white">Quick Add Task</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Task</label>
            <input
              type="text"
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-600 focus:outline-none"
              autoFocus
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Project</label>
              <select
                value={projectSlug}
                onChange={(e) => setProjectSlug(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
              >
                {projects.map(p => (
                  <option key={p.slug} value={p.slug}>
                    {p.name.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
              >
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading || !taskText.trim()}
              className="flex-1 flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              <Plus size={16} />
              {loading ? "Adding..." : "Add Task"}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            Press <kbd className="bg-slate-700 px-1 rounded">Esc</kbd> to close
          </p>
        </form>
      </div>
    </>
  );
}
