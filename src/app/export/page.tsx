"use client";

import { useEffect, useState } from "react";
import { getProjects, exportProjectToJSON, exportProjectToCSV, exportAllProjectsToJSON } from "@/lib/projects";
import Link from "next/link";
import { Download, FileJson, FileSpreadsheet, Copy, Check, Folder } from "lucide-react";

export default function ExportPage() {
  const [projects, setProjects] = useState<ReturnType<typeof getProjects>>([]);
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");
  const [exportedData, setExportedData] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  useEffect(() => {
    if (!selectedProject) return;

    if (selectedProject === "all") {
      if (exportFormat === "json") {
        setExportedData(exportAllProjectsToJSON(projects));
      } else {
        setExportedData("Export all projects to CSV is not supported. Please select a single project.");
      }
    } else {
      const project = projects.find(p => p.slug === selectedProject);
      if (project) {
        if (exportFormat === "json") {
          setExportedData(exportProjectToJSON(project));
        } else {
          setExportedData(exportProjectToCSV(project));
        }
      }
    }
  }, [selectedProject, exportFormat, projects]);

  const handleDownload = () => {
    const blob = new Blob([exportedData], { type: exportFormat === "json" ? "application/json" : "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    
    let filename = "project-manager-export";
    if (selectedProject !== "all") {
      const project = projects.find(p => p.slug === selectedProject);
      if (project) filename = project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    }
    
    a.download = `${filename}.${exportFormat === "json" ? "json" : "csv"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(exportedData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeProjects = projects.filter(p => p.status === "active");

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3">
              <Download size={32} />
              Export Projects
            </h1>
            <p className="text-gray-400 mt-1">Export your projects to JSON or CSV format</p>
          </div>
          <Link href="/" className="text-gray-400 hover:text-white transition">
            ← Back to Dashboard
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Export Options */}
          <div className="space-y-6">
            {/* Project Selection */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Folder size={18} className="text-cyan-400" />
                Select Project
              </h3>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-cyan-600 focus:outline-none"
              >
                <option value="all">All Projects ({projects.length})</option>
                {activeProjects.map(p => (
                  <option key={p.slug} value={p.slug}>{p.name}</option>
                ))}
              </select>
              <p className="text-gray-500 text-sm mt-2">
                {selectedProject === "all" 
                  ? "Exporting all projects (JSON only)" 
                  : `Exporting ${projects.find(p => p.slug === selectedProject)?.name || "project"}`}
              </p>
            </div>

            {/* Format Selection */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Export Format</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setExportFormat("json")}
                  className={`flex items-center gap-3 p-4 rounded-lg border transition ${
                    exportFormat === "json" 
                      ? "bg-cyan-900/30 border-cyan-600 text-cyan-300" 
                      : "bg-slate-700/50 border-slate-700 text-gray-400 hover:border-slate-600"
                  }`}
                >
                  <FileJson size={24} />
                  <div className="text-left">
                    <p className="font-medium">JSON</p>
                    <p className="text-xs opacity-70">Full data structure</p>
                  </div>
                </button>
                <button
                  onClick={() => setExportFormat("csv")}
                  disabled={selectedProject === "all"}
                  className={`flex items-center gap-3 p-4 rounded-lg border transition ${
                    exportFormat === "csv" 
                      ? "bg-cyan-900/30 border-cyan-600 text-cyan-300" 
                      : "bg-slate-700/50 border-slate-700 text-gray-400 hover:border-slate-600"
                  } ${selectedProject === "all" ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <FileSpreadsheet size={24} />
                  <div className="text-left">
                    <p className="font-medium">CSV</p>
                    <p className="text-xs opacity-70">Spreadsheet format</p>
                  </div>
                </button>
              </div>
              {selectedProject === "all" && (
                <p className="text-yellow-400 text-sm mt-2">
                  ⚠️ CSV export is only available for single projects
                </p>
              )}
            </div>

            {/* Export Button */}
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 py-4 rounded-lg transition font-medium"
            >
              <Download size={20} />
              Download {exportFormat.toUpperCase()}
            </button>
          </div>

          {/* Preview */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Preview</h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
              >
                {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="p-4 max-h-[500px] overflow-auto">
              <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap break-all">
                {exportedData || "Select a project to preview..."}
              </pre>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-4 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Total Projects</p>
            <p className="text-2xl font-bold text-white">{projects.length}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Total Tasks</p>
            <p className="text-2xl font-bold text-cyan-400">
              {projects.reduce((acc, p) => acc + p.tasks.length, 0)}
            </p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Pending Tasks</p>
            <p className="text-2xl font-bold text-yellow-400">
              {projects.reduce((acc, p) => acc + p.tasks.filter(t => !t.completed).length, 0)}
            </p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Completed</p>
            <p className="text-2xl font-bold text-green-400">
              {projects.reduce((acc, p) => acc + p.tasks.filter(t => t.completed).length, 0)}
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Export Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-400">
            <div>
              <h4 className="font-medium text-white mb-2">JSON Format</h4>
              <ul className="space-y-1">
                <li>• Complete project data structure</li>
                <li>• Includes all task details</li>
                <li>• Can be imported back</li>
                <li>• Best for backups</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">CSV Format</h4>
              <ul className="space-y-1">
                <li>• Spreadsheet compatible</li>
                <li>• Easy to edit in Excel/Numbers</li>
                <li>• Simple data view</li>
                <li>• Best for reporting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
