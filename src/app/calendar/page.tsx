"use client";

import { useEffect, useState } from "react";
import { getProjects, getPriorityColor, getTagColor } from "@/lib/projects";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Flag } from "lucide-react";

export default function CalendarPage() {
  const [projects, setProjects] = useState<ReturnType<typeof getProjects>>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const getTasksForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const tasks: any[] = [];
    
    for (const project of projects) {
      for (const task of project.tasks) {
        if (task.dueDate === dateStr && !task.completed) {
          tasks.push({ ...task, projectName: project.name, projectSlug: project.slug });
        }
      }
    }
    return tasks;
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Collect all tasks with due dates
  const allTasksWithDueDates = projects.flatMap(p => 
    p.tasks
      .filter(t => t.dueDate && !t.completed)
      .map(t => ({ ...t, projectName: p.name, projectSlug: p.slug }))
  );

  // Upcoming tasks (next 7 days)
  const upcomingTasks = allTasksWithDueDates
    .filter(t => {
      const dueDate = new Date(t.dueDate!);
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return dueDate >= now && dueDate <= weekFromNow;
    })
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3">
              <CalendarIcon size={32} />
              Calendar View
            </h1>
            <p className="text-gray-400 mt-1">View tasks on a calendar by due date</p>
          </div>
          <Link 
            href="/"
            className="text-gray-400 hover:text-white transition"
          >
            ← Back to Dashboard
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-3 bg-slate-800 border border-slate-700 rounded-xl p-6">
            {/* Month Navigation */}
            <div className="flex justify-between items-center mb-6">
              <button onClick={prevMonth} className="p-2 hover:bg-slate-700 rounded-lg transition">
                <ChevronLeft className="text-gray-400" />
              </button>
              <h2 className="text-xl font-semibold text-white">
                {monthNames[month]} {year}
              </h2>
              <button onClick={nextMonth} className="p-2 hover:bg-slate-700 rounded-lg transition">
                <ChevronRight className="text-gray-400" />
              </button>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                <div key={day} className="text-center text-gray-500 text-sm py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before first day of month */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square p-1" />
              ))}

              {/* Days of month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const tasks = getTasksForDate(day);
                const isToday = dateStr === todayStr;
                const isSelected = selectedDate?.toDateString() === new Date(year, month, day).toDateString();

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(new Date(year, month, day))}
                    className={`aspect-square p-1 border rounded-lg cursor-pointer transition ${
                      isToday 
                        ? "border-cyan-500 bg-cyan-900/30" 
                        : isSelected
                        ? "border-cyan-400"
                        : "border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    <span className={`text-sm ${isToday ? "text-cyan-400 font-bold" : "text-gray-300"}`}>
                      {day}
                    </span>
                    {tasks.length > 0 && (
                      <div className="mt-1">
                        {tasks.slice(0, 2).map((task: any) => (
                          <div
                            key={task.id}
                            className={`text-xs px-1 py-0.5 rounded truncate ${getPriorityColor(task.priority)}`}
                            title={`${task.projectName}: ${task.text}`}
                          >
                            {task.text}
                          </div>
                        ))}
                        {tasks.length > 2 && (
                          <div className="text-xs text-gray-500">+{tasks.length - 2} more</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Tasks */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock size={18} className="text-cyan-400" />
                Upcoming (7 days)
              </h3>
              {upcomingTasks.length > 0 ? (
                <div className="space-y-3">
                  {upcomingTasks.map((task: any) => (
                    <Link
                      key={`${task.projectSlug}-${task.id}`}
                      href={`/projects/${task.projectSlug}`}
                      className="block p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className="text-xs text-gray-400">{task.dueDate}</span>
                      </div>
                      <p className="text-sm text-white truncate">{task.text}</p>
                      <p className="text-xs text-gray-500">{task.projectName}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No upcoming tasks</p>
              )}
            </div>

            {/* Legend */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Flag size={18} className="text-cyan-400" />
                Priority
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${getPriorityColor("HIGH")}`}>HIGH</span>
                  <span className="text-gray-400">Urgent</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${getPriorityColor("MEDIUM")}`}>MEDIUM</span>
                  <span className="text-gray-400">Normal</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${getPriorityColor("LOW")}`}>LOW</span>
                  <span className="text-gray-400">Low priority</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4">This Month</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                  <p className="text-2xl font-bold text-cyan-400">
                    {allTasksWithDueDates.filter(t => {
                      const due = new Date(t.dueDate!);
                      return due.getMonth() === month && due.getFullYear() === year;
                    }).length}
                  </p>
                  <p className="text-xs text-gray-400">Tasks Due</p>
                </div>
                <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                  <p className="text-2xl font-bold text-green-400">
                    {allTasksWithDueDates.length}
                  </p>
                  <p className="text-xs text-gray-400">Total with Dates</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
