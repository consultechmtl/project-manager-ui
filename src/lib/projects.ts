import fs from "node:fs";
import path from "node:path";

const PROJECTS_DIR = path.join(process.env.HOME || "/home/xecutor", "dev", "projects");

export interface Task {
  id: number;
  text: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  assigned: string;
  completed: boolean;
}

export interface Project {
  name: string;
  slug: string;
  description: string;
  status: "active" | "completed";
  tasks: Task[];
}

function parseProject(content: string, name: string, slug: string): Project {
  const tasks: Task[] = [];
  
  const descMatch = content.match(/\*\*Description:\*\*\s*(.+)/);
  const status = content.includes("**Status:**") && content.includes("completed") ? "completed" : "active";
  
  const taskRegex = /- \[([ x])\] (HIGH|MEDIUM|LOW): (.+?) \(assigned: (\w+)\)/g;
  let match;
  while ((match = taskRegex.exec(content)) !== null) {
    tasks.push({
      id: tasks.length + 1,
      text: match[3],
      priority: match[2] as "HIGH" | "MEDIUM" | "LOW",
      assigned: match[4],
      completed: match[1] === "x"
    });
  }
  
  return {
    name: name.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    slug,
    description: descMatch ? descMatch[1] : "",
    status,
    tasks
  };
}

export function getProjects(): Project[] {
  const projects: Project[] = [];
  
  const activeDir = path.join(PROJECTS_DIR, "active");
  const completedDir = path.join(PROJECTS_DIR, "completed");
  
  // Parse active projects
  if (fs.existsSync(activeDir)) {
    const files = fs.readdirSync(activeDir).filter(f => f.endsWith(".md"));
    for (const file of files) {
      const content = fs.readFileSync(path.join(activeDir, file), "utf-8");
      const p = parseProject(content, file.replace(".md", ""), file.replace(".md", ""));
      if (p) projects.push(p);
    }
  }
  
  // Parse completed projects
  if (fs.existsSync(completedDir)) {
    const files = fs.readdirSync(completedDir).filter(f => f.endsWith(".md"));
    for (const file of files) {
      const content = fs.readFileSync(path.join(completedDir, file), "utf-8");
      const p = parseProject(content, file.replace(".md", ""), file.replace(".md", ""));
      if (p) projects.push(p);
    }
  }
  
  return projects;
}

export function getProject(slug: string): Project | null {
  const activePath = path.join(PROJECTS_DIR, "active", `${slug}.md`);
  const completedPath = path.join(PROJECTS_DIR, "completed", `${slug}.md`);
  
  let content: string | null = null;
  if (fs.existsSync(activePath)) {
    content = fs.readFileSync(activePath, "utf-8");
  } else if (fs.existsSync(completedPath)) {
    content = fs.readFileSync(completedPath, "utf-8");
  }
  
  if (!content) return null;
  return parseProject(content, slug, slug);
}

export function completeTask(slug: string, taskId: number): boolean {
  const activePath = path.join(PROJECTS_DIR, "active", `${slug}.md`);
  if (!fs.existsSync(activePath)) return false;
  
  const content = fs.readFileSync(activePath, "utf-8");
  const p = parseProject(content, slug, slug);
  
  const task = p.tasks.find(t => t.id === taskId);
  if (!task || task.completed) return false;
  
  // Update task status in content
  const newContent = content.replace(
    `- [ ] ${task.priority}: ${task.text} (assigned: ${task.assigned})`,
    `- [x] ${task.priority}: ${task.text} (assigned: ${task.assigned})`
  );
  
  fs.writeFileSync(activePath, newContent);
  return true;
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "HIGH": return "bg-red-900/50 text-red-300 border-red-700";
    case "MEDIUM": return "bg-yellow-900/50 text-yellow-300 border-yellow-700";
    case "LOW": return "bg-green-900/50 text-green-300 border-green-700";
    default: return "bg-gray-800 text-gray-300 border-gray-700";
  }
}

export function getPriorityBadge(priority: string): string {
  const colors = getPriorityColor(priority);
  return `px-2 py-0.5 rounded text-xs font-medium border ${colors}`;
}
