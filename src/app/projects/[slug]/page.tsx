"use client";

import { useEffect, useState, useParams } from "react";
import { getProject, completeTask, getPriorityBadge } from "@/lib/projects";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Circle, Clock } from "lucide-react";

export default function ProjectPage() {
  const params = useParams();
  const [project, setProject] = useState<ReturnType<typeof getProject>>(null);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (params.slug) {
      const p = getProject(params.slug as string);
      setProject(p);
      setCompletedCount(0); // Would need server-side update in real app
    }
  }, [params.slug]);

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

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Pending Tasks</h2>
          <div className="space-y-3">
            {pendingTasks.map(task => (
              <div
                key={task.id}
                className="flex items-center gap-4 bg-slate-800 border border-slate-700 rounded-lg p-4"
              >
                <button
                  onClick={() => {
                    if (completeTask(project.slug, task.id)) {
                      setProject(getProject(project.slug));
                    }
                  }}
                  className="text-gray-500 hover:text-green-400 transition"
                >
                  <Circle size={24} />
                </button>
                <div className="flex-1">
                  <p className="text-white">{task.text}</p>
                  <div className="flex gap-2 mt-2">
                    <span className={getPriorityBadge(task.priority)}>{task.priority}</span>
                    <span className="text-gray-500 text-sm">Assigned: {task.assigned}</span>
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
                <div key={task.id} className="flex items-center gap-4 text-gray-500">
                  <CheckCircle size={20} className="text-green-400" />
                  <span>{task.text}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
