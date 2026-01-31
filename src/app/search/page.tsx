"use client";

import { useEffect, useState, useMemo } from "react";
import { getProjects, getPriorityBadge, getTagColor, getPriorityColor } from "@/lib/projects";
import Link from "next/link";
import { Search, Filter, X, Folder, Clock, Flag, Tag, User } from "lucide-react";

export default function SearchPage() {
  const [projects, setProjects] = useState<ReturnType<typeof getProjects>>([]);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    priority: "" as "" | "HIGH" | "MEDIUM" | "LOW",
    assignee: "",
    status: "" as "" | "pending" | "completed",
    project: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  // Flatten all tasks
  const allTasks = useMemo(() => {
    return projects.flatMap(p =>
      p.tasks
        .filter(t => !t.completed || filters.status === "completed")
        .map(t => ({
          ...t,
          projectName: p.name,
          projectSlug: p.slug,
          projectDescription: p.description,
        }))
    );
  }, [projects, filters.status]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return allTasks.filter(task => {
      // Text search
      if (query) {
        const searchText = query.toLowerCase();
        const matchesText =
          task.text.toLowerCase().includes(searchText) ||
          task.projectName.toLowerCase().includes(searchText) ||
          task.description?.toLowerCase().includes(searchText) ||
          task.tags?.some(tag => tag.toLowerCase().includes(searchText));
        if (!matchesText) return false;
      }

      // Priority filter
      if (filters.priority && task.priority !== filters.priority) return false;

      // Assignee filter
      if (filters.assignee && task.assigned !== filters.assignee) return false;

      // Status filter
      if (filters.status === "pending" && task.completed) return false;
      if (filters.status === "completed" && !task.completed) return false;

      // Project filter
      if (filters.project && task.projectSlug !== filters.project) return false;

      return true;
    });
  }, [allTasks, query, filters]);

  // Get unique values for filters
  const assignees = useMemo(() =>
    [...new Set(projects.flatMap(p => p.tasks.map(t => t.assigned).filter(Boolean)))],
    [projects]
  );

  const activeProjects = projects.filter(p => p.status === "active");

  const clearFilters = () => {
    setQuery("");
    setFilters({ priority: "", assignee: "", status: "", project: "" });
  };

  const hasActiveFilters = query || filters.priority || filters.assignee || filters.status || filters.project;

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3">
            <Search size={32} />
            Search Tasks
          </h1>
          <p className="text-gray-400 mt-1">Search and filter across all your projects</p>
        </header>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, projects, tags..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:border-cyan-600 focus:outline-none text-lg"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Filter Toggle & Active Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              showFilters ? "bg-cyan-600" : "bg-slate-700 hover:bg-slate-600"
            }`}
          >
            <Filter size={18} />
            Filters
            {hasActiveFilters && (
              <span className="bg-cyan-400 text-slate-900 text-xs px-2 py-0.5 rounded-full">
                {[
                  filters.priority,
                  filters.assignee,
                  filters.status,
                  filters.project,
                ].filter(Boolean).length}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition text-gray-300"
            >
              <X size={18} />
              Clear all
            </button>
          )}

          <span className="ml-auto text-gray-400 flex items-center gap-2">
            <Folder size={16} />
            {filteredTasks.length} results
          </span>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Priority Filter */}
              <div>
                <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <Flag size={14} className="text-cyan-400" />
                  Priority
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">All Priorities</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              {/* Assignee Filter */}
              <div>
                <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <User size={14} className="text-cyan-400" />
                  Assignee
                </label>
                <select
                  value={filters.assignee}
                  onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">All Assignees</option>
                  {assignees.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <Clock size={14} className="text-cyan-400" />
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Project Filter */}
              <div>
                <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <Folder size={14} className="text-cyan-400" />
                  Project
                </label>
                <select
                  value={filters.project}
                  onChange={(e) => setFilters({ ...filters, project: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">All Projects</option>
                  {activeProjects.map(p => (
                    <option key={p.slug} value={p.slug}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="space-y-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <Link
                key={`${task.projectSlug}-${task.id}`}
                href={`/projects/${task.projectSlug}`}
                className="block bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-cyan-700 transition"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-1 h-12 rounded-full mt-1 ${getPriorityColor(task.priority).replace("bg-", "bg-opacity-100 bg-").split(" ")[0]}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={getPriorityBadge(task.priority)}>{task.priority}</span>
                      <span className="text-gray-500 text-sm">{task.projectName}</span>
                      {task.completed && (
                        <span className="bg-green-900/50 text-green-300 px-2 py-0.5 rounded text-xs">
                          Completed
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg text-white font-medium">{task.text}</h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-400">
                      {task.assigned && task.assigned !== "UNASSIGNED" && (
                        <span className="flex items-center gap-1">
                          <User size={14} />
                          {task.assigned}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-orange-400">
                          <Clock size={14} />
                          {task.dueDate}
                        </span>
                      )}
                      {task.tags?.map(tag => (
                        <span key={tag} className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs border ${getTagColor(tag)}`}>
                          <Tag size={10} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Search size={48} className="mx-auto mb-4 opacity-50" />
              <p>No tasks found matching your criteria</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-cyan-400 hover:underline mt-2"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
