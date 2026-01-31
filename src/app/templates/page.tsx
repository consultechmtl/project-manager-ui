"use client";

import { useEffect, useState } from "react";
import { getTemplates, getTemplatesByCategory, createProjectFromTemplate, ProjectTemplate } from "@/lib/projects";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FolderOpen, Plus, Clock, Tag, BookOpen } from "lucide-react";

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<ReturnType<typeof getTemplates>>([]);
  const [templatesByCategory, setTemplatesByCategory] = useState<Record<string, ProjectTemplate[]>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [projectName, setProjectName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setTemplates(getTemplates());
    setTemplatesByCategory(getTemplatesByCategory());
  }, []);

  const handleCreateProject = async (template: ProjectTemplate) => {
    if (!projectName.trim()) return;
    setCreating(true);
    
    try {
      const project = createProjectFromTemplate(template, projectName);
      
      // Save project to file
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: project.name,
          description: project.description,
          tasks: project.tasks,
        }),
      });
      
      if (response.ok) {
        router.push(`/projects/${project.slug}`);
      }
    } catch {
      alert("Failed to create project from template");
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3">
              <BookOpen size={32} />
              Project Templates
            </h1>
            <p className="text-gray-400 mt-1">Start quickly with pre-built project templates</p>
          </div>
          <Link href="/" className="text-gray-400 hover:text-white transition">
            ← Back to Dashboard
          </Link>
        </header>

        {/* Selected Template Preview */}
        {selectedTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setSelectedTemplate(null)}>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-cyan-400 text-sm">{selectedTemplate.category}</span>
                  <h2 className="text-2xl font-bold text-white mt-1">{selectedTemplate.name}</h2>
                  <p className="text-gray-400 mt-2">{selectedTemplate.description}</p>
                </div>
                <button onClick={() => setSelectedTemplate(null)} className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Tasks Preview */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Tasks ({selectedTemplate.tasks.length})</h3>
                <div className="space-y-2">
                  {selectedTemplate.tasks.slice(0, 8).map((task, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-slate-700/50 rounded-lg">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        task.priority === "HIGH" ? "bg-red-900/50 text-red-300" :
                        task.priority === "MEDIUM" ? "bg-yellow-900/50 text-yellow-300" :
                        "bg-green-900/50 text-green-300"
                      }`}>{task.priority}</span>
                      <span className="text-gray-300 flex-1">{task.text}</span>
                      {task.dueDays > 0 && (
                        <span className="text-gray-500 text-xs flex items-center gap-1">
                          <Clock size={12} />
                          Day {task.dueDays}
                        </span>
                      )}
                    </div>
                  ))}
                  {selectedTemplate.tasks.length > 8 && (
                    <p className="text-gray-500 text-sm text-center py-2">
                      + {selectedTemplate.tasks.length - 8} more tasks
                    </p>
                  )}
                </div>
              </div>

              {/* Create Project Form */}
              <div className="border-t border-slate-700 pt-6">
                <h3 className="text-lg font-semibold text-white mb-3">Create Project from Template</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-600 focus:outline-none"
                    onKeyDown={e => e.key === "Enter" && projectName && handleCreateProject(selectedTemplate)}
                  />
                  <button
                    onClick={() => handleCreateProject(selectedTemplate)}
                    disabled={!projectName.trim() || creating}
                    className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 px-6 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={18} />
                    {creating ? "Creating..." : "Create"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Templates by Category */}
        <div className="space-y-8">
          {Object.entries(templatesByCategory).map(([category, categoryTemplates]) => (
            <div key={category}>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FolderOpen size={20} className="text-cyan-400" />
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryTemplates.map(template => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-cyan-700 cursor-pointer transition group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-white group-hover:text-cyan-400 transition">
                        {template.name}
                      </h3>
                      <span className="text-xs text-gray-500 bg-slate-700 px-2 py-1 rounded">
                        {template.tasks.length} tasks
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{template.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {template.tasks.slice(0, 3).map((task, i) => (
                        <span key={i} className={`text-xs px-2 py-0.5 rounded ${
                          task.priority === "HIGH" ? "bg-red-900/50 text-red-300" :
                          task.priority === "MEDIUM" ? "bg-yellow-900/50 text-yellow-300" :
                          "bg-green-900/50 text-green-300"
                        }`}>
                          {task.priority}
                        </span>
                      ))}
                      {template.tasks.length > 3 && (
                        <span className="text-xs text-gray-500">+{template.tasks.length - 3} more</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="mt-12 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Template Tips</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>• Click any template to preview tasks and create a project</li>
            <li>• Templates include pre-scheduled tasks with due dates</li>
            <li>• You can customize tasks after creating the project</li>
            <li>• New templates can be added in the code</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
