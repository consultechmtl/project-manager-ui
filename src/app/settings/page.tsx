"use client";

import { useEffect, useState } from "react";
import { getProjects, getTemplates, ProjectTemplate } from "@/lib/projects";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Settings, Moon, Sun, Bell, Keyboard, Save, RotateCcw } from "lucide-react";

interface UserSettings {
  darkMode: boolean;
  notifications: boolean;
  keyboardShortcuts: boolean;
  defaultPriority: "HIGH" | "MEDIUM" | "LOW";
  defaultAssignee: string;
  compactView: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  darkMode: true,
  notifications: true,
  keyboardShortcuts: true,
  defaultPriority: "MEDIUM",
  defaultAssignee: "UNASSIGNED",
  compactView: false,
};

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [projects, setProjects] = useState<ReturnType<typeof getProjects>>([]);
  const [templates, setTemplates] = useState<ReturnType<typeof getTemplates>>([]);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("project-manager-settings");
    if (savedSettings) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      } catch {
        setSettings(DEFAULT_SETTINGS);
      }
    }
    
    setProjects(getProjects().filter(p => p.status === "active"));
    setTemplates(getTemplates());
  }, []);

  useEffect(() => {
    // Apply dark mode
    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings.darkMode]);

  const handleSave = () => {
    localStorage.setItem("project-manager-settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem("project-manager-settings");
  };

  const toggleDarkMode = () => {
    setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const stats = {
    projects: projects.length,
    tasks: projects.reduce((acc, p) => acc + p.tasks.length, 0),
    pending: projects.reduce((acc, p) => acc + p.tasks.filter(t => !t.completed).length, 0),
    completed: projects.reduce((acc, p) => acc + p.tasks.filter(t => t.completed).length, 0),
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3">
              <Settings size={32} />
              Settings
            </h1>
            <p className="text-gray-400 mt-1">Customize your project manager experience</p>
          </div>
          <Link href="/" className="text-gray-400 hover:text-white transition">
            ← Back to Dashboard
          </Link>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Projects</p>
            <p className="text-2xl font-bold text-white">{stats.projects}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Total Tasks</p>
            <p className="text-2xl font-bold text-cyan-400">{stats.tasks}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Completed</p>
            <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appearance */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Moon size={18} className="text-cyan-400" />
              Appearance
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {settings.darkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-blue-400" />}
                  <span className="text-gray-300">Dark Mode</span>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`w-12 h-6 rounded-full transition ${
                    settings.darkMode ? "bg-cyan-600" : "bg-slate-600"
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition transform ${
                    settings.darkMode ? "translate-x-6" : "translate-x-0.5"
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Bell size={18} className="text-cyan-400" />
              Notifications
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <span className="text-gray-300">Enable notifications</span>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, notifications: !prev.notifications }))}
                  className={`w-12 h-6 rounded-full transition ${
                    settings.notifications ? "bg-cyan-600" : "bg-slate-600"
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition transform ${
                    settings.notifications ? "translate-x-6" : "translate-x-0.5"
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Keyboard size={18} className="text-cyan-400" />
              Keyboard Shortcuts
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <span className="text-gray-300">Enable shortcuts</span>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, keyboardShortcuts: !prev.keyboardShortcuts }))}
                  className={`w-12 h-6 rounded-full transition ${
                    settings.keyboardShortcuts ? "bg-cyan-600" : "bg-slate-600"
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition transform ${
                    settings.keyboardShortcuts ? "translate-x-6" : "translate-x-0.5"
                  }`} />
                </button>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg text-sm text-gray-400">
                <p className="text-white mb-2">Available shortcuts:</p>
                <ul className="space-y-1">
                  <li><code className="text-cyan-400">n</code> - New Project</li>
                  <li><code className="text-cyan-400">/</code> - Search</li>
                  <li><code className="text-cyan-400">c</code> - Calendar</li>
                  <li><code className="text-cyan-400">h</code> - Home</li>
                  <li><code className="text-cyan-400">?</code> - Help</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Defaults */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Default Values</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Default Priority</label>
                <select
                  value={settings.defaultPriority}
                  onChange={(e) => setSettings(prev => ({ ...prev, defaultPriority: e.target.value as any }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                >
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Default Assignee</label>
                <select
                  value={settings.defaultAssignee}
                  onChange={(e) => setSettings(prev => ({ ...prev, defaultAssignee: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                >
                  <option value="UNASSIGNED">Unassigned</option>
                  <option value="CLAWD">CLAWD</option>
                  <option value="HUMAN">HUMAN</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 px-6 py-3 rounded-lg transition"
          >
            <Save size={18} />
            {saved ? "Saved!" : "Save Settings"}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-lg transition"
          >
            <RotateCcw size={18} />
            Reset to Defaults
          </button>
        </div>

        {/* Data Management */}
        <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Data Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <p className="text-white font-medium mb-2">Templates Available</p>
              <p className="text-2xl font-bold text-cyan-400">{templates.length}</p>
              <Link href="/templates" className="text-sm text-cyan-400 hover:underline">
                View templates →
              </Link>
            </div>
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <p className="text-white font-medium mb-2">Export Data</p>
              <p className="text-gray-400 text-sm mb-2">Download all projects</p>
              <Link href="/export" className="text-sm text-cyan-400 hover:underline">
                Go to export →
              </Link>
            </div>
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <p className="text-white font-medium mb-2">Activity Log</p>
              <p className="text-gray-400 text-sm mb-2">View recent changes</p>
              <Link href="/activity" className="text-sm text-cyan-400 hover:underline">
                View activity →
              </Link>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">About</h2>
          <div className="text-gray-400 text-sm space-y-2">
            <p><span className="text-cyan-400">Project Manager</span> - AI-powered task management</p>
            <p>Version 1.0.0</p>
            <p>Built with Next.js, React, and Tailwind CSS</p>
            <p>Features JARVIS AI assistant for conversational help</p>
          </div>
        </div>
      </div>
    </main>
  );
}
