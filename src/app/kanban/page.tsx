"use client";

import { useEffect, useState } from "react";
import { getProjects, getPriorityColor, Task } from "@/lib/projects";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Kanban, 
  MoreHorizontal, 
  Plus,
  GripVertical,
  Clock,
  User,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronRight
} from "lucide-react";

interface ProjectWithTasks {
  name: string;
  slug: string;
  tasks: Task[];
}

export default function KanbanPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectWithTasks[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const allProjects = getProjects().filter(p => p.status === "active");
    setProjects(allProjects.map(p => ({ name: p.name, slug: p.slug, tasks: p.tasks })));
    // Expand all by default
    const expanded: Record<string, boolean> = {};
    allProjects.forEach(p => expanded[p.slug] = true);
    setExpandedProjects(expanded);
  }, []);

  const toggleProject = (slug: string) => {
    setExpandedProjects(prev => ({ ...prev, [slug]: !prev[slug] }));
  };

  const getTasksByStatus = (tasks: Task[]) => {
    return {
      pending: tasks.filter(t => !t.completed),
      completed: tasks.filter(t => t.completed),
    };
  };

  const selectedData = selectedProject === "all" 
    ? projects 
    : projects.filter(p => p.slug === selectedProject);

  const activeProjects = getProjects().filter(p => p.status === "active");

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3">
              <Kanban size={32} />
              Kanban Board
            </h1>
            <p className="text-gray-400 mt-1">Drag and drop tasks between columns</p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="all">All Projects</option>
              {activeProjects.map(p => (
                <option key={p.slug} value={p.slug}>{p.name}</option>
              ))}
            </select>
            <Link href="/" className="text-gray-400 hover:text-white transition flex items-center">
              ← Back
            </Link>
          </div>
        </header>

        {selectedData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Kanban size={48} className="mx-auto mb-4 opacity-50" />
            <p>No projects found</p>
            <Link href="/new" className="text-cyan-400 hover:underline mt-2 block">
              Create a project first
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {selectedData.map(project => {
              const { pending, completed } = getTasksByStatus(project.tasks);
              const isExpanded = expandedProjects[project.slug];

              return (
                <div key={project.slug} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                  {/* Project Header */}
                  <div 
                    className="p-4 bg-slate-900/50 border-b border-slate-700 flex items-center justify-between cursor-pointer hover:bg-slate-900/70 transition"
                    onClick={() => toggleProject(project.slug)}
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown size={18} className="text-gray-400" />
                      ) : (
                        <ChevronRight size={18} className="text-gray-400" />
                      )}
                      <h2 className="text-lg font-semibold text-white">{project.name}</h2>
                      <span className="text-sm text-gray-500">
                        ({pending.length} pending, {completed.length} done)
                      </span>
                    </div>
                    <button className="p-1 text-gray-400 hover:text-white">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-4">
                        {/* Pending Column */}
                        <div className="bg-slate-900/50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-yellow-400 flex items-center gap-2">
                              <Clock size={16} />
                              Pending
                            </h3>
                            <span className="text-sm text-gray-500 bg-slate-800 px-2 py-0.5 rounded">
                              {pending.length}
                            </span>
                          </div>
                          <div className="space-y-3 min-h-[200px]">
                            {pending.length > 0 ? (
                              pending.map(task => (
                                <div
                                  key={task.id}
                                  className={`p-3 bg-slate-800 border border-slate-700 rounded-lg hover:border-cyan-600 cursor-grab active:cursor-grabbing transition ${getPriorityColor(task.priority)}`}
                                >
                                  <div className="flex items-start gap-2">
                                    <GripVertical size={14} className="text-gray-600 mt-1" />
                                    <div className="flex-1">
                                      <p className="text-white text-sm">{task.text}</p>
                                      <div className="flex flex-wrap items-center gap-2 mt-2">
                                        {task.assigned && task.assigned !== "UNASSIGNED" && (
                                          <span className="flex items-center gap-1 text-xs text-gray-400">
                                            <User size={10} />
                                            {task.assigned}
                                          </span>
                                        )}
                                        {task.dueDate && (
                                          <span className="flex items-center gap-1 text-xs text-orange-400">
                                            <CalendarIcon size={10} />
                                            {task.dueDate}
                                          </span>
                                        )}
                                      </div>
                                      {task.tags && task.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {task.tags.map(tag => (
                                            <span key={tag} className="text-xs px-1.5 py-0.5 bg-slate-700 text-gray-300 rounded">
                                              {tag}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8 text-gray-500 text-sm">
                                No pending tasks
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Completed Column */}
                        <div className="bg-slate-900/50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-green-400 flex items-center gap-2">
                              <Clock size={16} />
                              Completed
                            </h3>
                            <span className="text-sm text-gray-500 bg-slate-800 px-2 py-0.5 rounded">
                              {completed.length}
                            </span>
                          </div>
                          <div className="space-y-3 min-h-[200px]">
                            {completed.length > 0 ? (
                              completed.map(task => (
                                <div
                                  key={task.id}
                                  className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg opacity-60"
                                >
                                  <p className="text-white text-sm line-through">{task.text}</p>
                                  <div className="flex flex-wrap items-center gap-2 mt-2">
                                    {task.assigned && task.assigned !== "UNASSIGNED" && (
                                      <span className="flex items-center gap-1 text-xs text-gray-400">
                                        <User size={10} />
                                        {task.assigned}
                                      </span>
                                    )}
                                    {task.completedDate && (
                                      <span className="text-xs text-green-400">
                                        Done: {task.completedDate}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8 text-gray-500 text-sm">
                                No completed tasks
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Kanban Tips</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
            <li>• Click project headers to expand/collapse</li>
            <li>• Use the project filter to focus on one project</li>
            <li>• Drag tasks to reorder (coming soon)</li>
            <li>• Tasks are color-coded by priority</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
