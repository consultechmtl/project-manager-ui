"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProject, completeTask, getPriorityBadge, getTagColor } from "@/lib/projects";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Circle, Clock, User, Tag, Calendar, Plus } from "lucide-react";

export default function ProjectPage() {
  const params = useParams();
  const [project, setProject] = useState<ReturnType<typeof getProject>>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ text: "", priority: "MEDIUM", assigned: "CLAWD", dueDate: "", tags: "" });

  useEffect(() => {
    if (params.slug) {
      const p = getProject(params.slug as string);
      setProject(p);
    }
  }, [params.slug]);

  const handleComplete = (taskId: number) => {
    if (params.slug && completeTask(params.slug as string, taskId)) {
      setProject(getProject(params.slug as string));
    }
  };

  if (!project) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl text-gray-400">Project not found</h1>
          <Link href="/" className="text-cyan-400 hover:underline mt-4 block">
            ← Back to projects
          </Link>
        </div>
      </main>
    );
  }

  const pendingTasks = project.tasks.filter(t => !t.completed);
  const completedTasks = project.tasks.filter(t => t.completed);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition">
          <ArrowLeft size={18} />
          Back to projects
        </Link>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white">{project.name}</h1>
          <p className="text-gray-400 mt-2">{project.description}</p>
          <div className="flex gap-4 mt-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {pendingTasks.length} pending
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle size={14} />
              {completedTasks.length} completed
            </span>
          </div>
        </header>

        {/* Add Task Button */}
        <button
          onClick={() => setShowAddTask(!showAddTask)}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-lg transition mb-6"
        >
          <Plus size={18} />
          Add Task
        </button>

        {/* Add Task Form */}
        {showAddTask && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">New Task</h3>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Task Description</label>
                <input
                  type="text"
                  value={newTask.text}
                  onChange={(e) => setNewTask({ ...newTask, text: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  placeholder="What needs to be done?"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Assignee</label>
                  <select
                    value={newTask.assigned}
                    onChange={(e) => setNewTask({ ...newTask, assigned: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="CLAWD">CLAWD</option>
                    <option value="HUMAN">HUMAN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.targetName="w-full.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newTask.tags}
                  onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  placeholder="frontend, backend, design"
                />
              </div>
              <button
                onClick={() => {
                  if (newTask.text) {
                    // API call would go here
                    setShowAddTask(false);
                    setNewTask({ text: "", priority: "MEDIUM", assigned: "CLAWD", dueDate: "", tags: "" });
                  }
                }}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 rounded-lg transition"
              >
                Add Task
              </button>
            </div>
          </div>
        )}

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Pending Tasks</h2>
          <div className="space-y-3">
            {pendingTasks.map(task => (
              <div
                key={task.id}
                className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-cyan-700 transition"
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => handleComplete(task.id)}
                    className="text-gray-500 hover:text-green-400 transition mt-1"
                  >
                    <Circle size={24} />
                  </button>
                  <div className="flex-1">
                    <p className="text-white text-lg">{task.text}</p>
                    
                    {/* Task Metadata */}
                    <div className="flex flex-wrap gap-3 mt-3">
                      <span className={getPriorityBadge(task.priority)}>{task.priority}</span>
                      
                      <span className="flex items-center gap-1 text-gray-400 text-sm">
                        <User size={14} />
                        {task.assigned}
                      </span>
                      
                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-orange-400 text-sm">
                          <Calendar size={14} />
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
              </div>
            ))}
            {pendingTasks.length === 0 && (
              <p className="text-gray-500 text-center py-8">All tasks completed! 🎉</p>
            )}
          </div>
        </section>

        {completedTasks.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Completed</h2>
            <div className="space-y-2 opacity-60">
              {completedTasks.map(task => (
                <div key={task.id} className="flex items-center gap-4 text-gray-500 p-3">
                  <CheckCircle size={20} className="text-green-400" />
                  <span className="line-through">{task.text}</span>
                  {task.dueDate && <span className="text-xs">due: {task.dueDate}</span>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
