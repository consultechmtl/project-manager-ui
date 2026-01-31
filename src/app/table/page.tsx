"use client";

import { useEffect, useState, useMemo } from "react";
import { getProjects, getPriorityColor, getPriorityBadge, Task } from "@/lib/projects";
import Link from "next/link";
import { Table, ArrowUpDown, ChevronUp, ChevronDown, Search, Filter } from "lucide-react";

interface TaskWithProject extends Task {
  projectName: string;
  projectSlug: string;
}

type SortField = "priority" | "dueDate" | "projectName" | "assigned";
type SortDirection = "asc" | "desc";

export default function TablePage() {
  const [projects, setProjects] = useState<ReturnType<typeof getProjects>>([]);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("priority");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  useEffect(() => {
    setProjects(getProjects().filter(p => p.status === "active"));
  }, []);

  const allTasks: TaskWithProject[] = useMemo(() => {
    return projects.flatMap(p => 
      p.tasks.map(t => ({ ...t, projectName: p.name, projectSlug: p.slug }))
    );
  }, [projects]);

  const filteredTasks = useMemo(() => {
    let result = [...allTasks];
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(t => 
        t.text.toLowerCase().includes(searchLower) ||
        t.projectName.toLowerCase().includes(searchLower) ||
        t.assigned.toLowerCase().includes(searchLower) ||
        t.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    // Priority filter
    if (filterPriority) {
      result = result.filter(t => t.priority === filterPriority);
    }
    
    // Status filter
    if (filterStatus) {
      if (filterStatus === "pending") {
        result = result.filter(t => !t.completed);
      } else if (filterStatus === "completed") {
        result = result.filter(t => t.completed);
      }
    }
    
    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case "priority":
          const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case "dueDate":
          if (!a.dueDate && !b.dueDate) comparison = 0;
          else if (!a.dueDate) comparison = 1;
          else if (!b.dueDate) comparison = -1;
          else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case "projectName":
          comparison = a.projectName.localeCompare(b.projectName);
          break;
        case "assigned":
          comparison = a.assigned.localeCompare(b.assigned);
          break;
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });
    
    return result;
  }, [allTasks, search, sortField, sortDirection, filterPriority, filterStatus]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="text-gray-600" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp size={14} className="text-cyan-400" />
    ) : (
      <ChevronDown size={14} className="text-cyan-400" />
    );
  };

  const stats = {
    total: allTasks.length,
    pending: allTasks.filter(t => !t.completed).length,
    completed: allTasks.filter(t => t.completed).length,
    overdue: allTasks.filter(t => {
      if (!t.dueDate || t.completed) return false;
      return new Date(t.dueDate) < new Date();
    }).length,
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3">
              <Table size={32} />
              Table View
            </h1>
            <p className="text-gray-400 mt-1">Spreadsheet-style task management</p>
          </div>
          <Link href="/" className="text-gray-400 hover:text-white transition">
            ← Back to Dashboard
          </Link>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Total Tasks</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Completed</p>
            <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Overdue</p>
            <p className="text-2xl font-bold text-red-400">{stats.overdue}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tasks..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:border-cyan-600 focus:outline-none"
                />
              </div>
            </div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="">All Priorities</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-700">
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">
                    <button 
                      onClick={() => handleSort("priority")}
                      className="flex items-center gap-1 hover:text-white"
                    >
                      Priority
                      <SortIcon field="priority" />
                    </button>
                  </th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Task</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">
                    <button 
                      onClick={() => handleSort("projectName")}
                      className="flex items-center gap-1 hover:text-white"
                    >
                      Project
                      <SortIcon field="projectName" />
                    </button>
                  </th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">
                    <button 
                      onClick={() => handleSort("assigned")}
                      className="flex items-center gap-1 hover:text-white"
                    >
                      Assigned
                      <SortIcon field="assigned" />
                    </button>
                  </th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">
                    <button 
                      onClick={() => handleSort("dueDate")}
                      className="flex items-center gap-1 hover:text-white"
                    >
                      Due Date
                      <SortIcon field="dueDate" />
                    </button>
                  </th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length > 0 ? (
                  filteredTasks.map(task => (
                    <tr 
                      key={`${task.projectSlug}-${task.id}`}
                      className="border-b border-slate-700/50 hover:bg-slate-700/30 transition"
                    >
                      <td className="p-4">
                        <span className={`${getPriorityBadge(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        <Link 
                          href={`/projects/${task.projectSlug}`}
                          className="text-white hover:text-cyan-400 transition"
                        >
                          {task.text}
                        </Link>
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {task.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-xs px-1.5 py-0.5 bg-slate-700 text-gray-400 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <Link 
                          href={`/projects/${task.projectSlug}`}
                          className="text-cyan-400 hover:underline text-sm"
                        >
                          {task.projectName}
                        </Link>
                      </td>
                      <td className="p-4 text-gray-300 text-sm">
                        {task.assigned !== "UNASSIGNED" ? task.assigned : "-"}
                      </td>
                      <td className="p-4">
                        {task.dueDate ? (
                          <span className={`text-sm ${
                            new Date(task.dueDate) < new Date() && !task.completed
                              ? "text-red-400"
                              : "text-gray-300"
                          }`}>
                            {task.dueDate}
                          </span>
                        ) : (
                          <span className="text-gray-600 text-sm">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`text-sm px-2 py-1 rounded ${
                          task.completed
                            ? "bg-green-900/50 text-green-300"
                            : "bg-yellow-900/50 text-yellow-300"
                        }`}>
                          {task.completed ? "Done" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No tasks found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-right text-gray-500 text-sm">
          Showing {filteredTasks.length} of {allTasks.length} tasks
        </div>
      </div>
    </main>
  );
}
