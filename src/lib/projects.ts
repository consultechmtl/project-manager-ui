import fs from "node:fs";
import path from "node:path";

const PROJECTS_DIR = path.join(process.env.HOME || "/home/xecutor", "dev", "projects");

export interface Task {
  id: number;
  text: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  assigned: string;
  dueDate?: string;
  tags: string[];
  description?: string;
  subtasks: SubTask[];
  completed: boolean;
  completedDate?: string;
}

export interface SubTask {
  id: number;
  text: string;
  completed: boolean;
}

export interface Project {
  name: string;
  slug: string;
  description: string;
  created: string;
  status: "active" | "completed";
  tasks: Task[];
}

function parseProject(content: string, name: string, slug: string): Project {
  const tasks: Task[] = [];
  
  const descMatch = content.match(/\*\*Description:\*\*\s*(.+)/);
  const status = content.includes("**Status:**") && content.includes("completed") ? "completed" : "active";
  
  // Parse tasks with new fields
  const taskRegex = /- \[([ x])\] (HIGH|MEDIUM|LOW): (.+?)(?:\s*\|\s*assigned:\s*(\w+))?(?:\s*\|\s*due:\s*([^|\n]+))?(?:\s*\|\s*tags:\s*([^\n]+))?(?:\s*\|\s*desc:\s*([^\n]+))?/g;
  let match;
  while ((match = taskRegex.exec(content)) !== null) {
    const text = match[3];
    const assigned = match[4] || "UNASSIGNED";
    const dueDate = match[5]?.trim();
    const tagsStr = match[6];
    const description = match[7];
    const tags = tagsStr ? tagsStr.split(",").map(t => t.trim()) : [];
    
    // Parse subtasks (indented with - [ ] or - [x])
    const subtasks: SubTask[] = [];
    const subtaskRegex = new RegExp(`  - \\[([ x])\\] (.+)`, "g");
    let subMatch;
    const subtaskSection = content.substring(match.index).split("\n").slice(1);
    for (const line of subtaskSection) {
      if (line.startsWith("  - [")) {
        const subDone = line.includes("[x]");
        const subText = line.replace(/  - \[([ x])\] /, "").trim();
        subtasks.push({ id: subtasks.length + 1, text: subText, completed: subDone });
      } else if (line.trim() && !line.startsWith("  -")) {
        break;
      }
    }
    
    tasks.push({
      id: tasks.length + 1,
      text,
      priority: match[2] as "HIGH" | "MEDIUM" | "LOW",
      assigned,
      dueDate: dueDate || undefined,
      tags,
      description: description || undefined,
      subtasks,
      completed: match[1] === "x"
    });
  }
  
  return {
    name: name.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    slug,
    description: descMatch ? descMatch[1] : "",
    created: new Date().toISOString().split("T")[0],
    status,
    tasks
  };
}

export function getProjects(): Project[] {
  const projects: Project[] = [];
  
  const activeDir = path.join(PROJECTS_DIR, "active");
  const completedDir = path.join(PROJECTS_DIR, "completed");
  
  if (fs.existsSync(activeDir)) {
    const files = fs.readdirSync(activeDir).filter(f => f.endsWith(".md"));
    for (const file of files) {
      const content = fs.readFileSync(path.join(activeDir, file), "utf-8");
      const p = parseProject(content, file.replace(".md", ""), file.replace(".md", ""));
      if (p) projects.push(p);
    }
  }
  
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

export function addTask(slug: string, task: { text: string; priority: string; assigned: string; dueDate?: string; tags?: string[]; description?: string }): boolean {
  const activePath = path.join(PROJECTS_DIR, "active", `${slug}.md`);
  if (!fs.existsSync(activePath)) return false;
  
  const content = fs.readFileSync(activePath, "utf-8");
  const tags = task.tags?.join(", ") || "";
  const desc = task.description || "";
  const due = task.dueDate ? `| due: ${task.dueDate}` : "";
  const tagStr = tags ? `| tags: ${tags}` : "";
  const descStr = desc ? `| desc: ${desc}` : "";
  
  const newTask = `- [ ] ${task.priority}: ${task.text} (assigned: ${task.assigned})${due}${tagStr}${descStr}\n`;
  const newContent = content.replace("## Tasks", `## Tasks\n${newTask}`);
  
  fs.writeFileSync(activePath, newContent);
  return true;
}

export function completeTask(slug: string, taskId: number): boolean {
  const activePath = path.join(PROJECTS_DIR, "active", `${slug}.md`);
  if (!fs.existsSync(activePath)) return false;
  
  const content = fs.readFileSync(activePath, "utf-8");
  const p = parseProject(content, slug, slug);
  
  const task = p.tasks.find(t => t.id === taskId);
  if (!task || task.completed) return false;
  
  const newContent = content.replace(
    `- [ ] ${task.priority}: ${task.text} (assigned: ${task.assigned})`,
    `- [x] ${task.priority}: ${task.text} (assigned: ${task.assigned})`
  );
  
  fs.writeFileSync(activePath, newContent);
  return true;
}

export function updateTask(slug: string, taskId: number, updates: Partial<Task>): boolean {
  const activePath = path.join(PROJECTS_DIR, "active", `${slug}.md`);
  if (!fs.existsSync(activePath)) return false;
  
  const content = fs.readFileSync(activePath, "utf-8");
  const p = parseProject(content, slug, slug);
  
  const task = p.tasks.find(t => t.id === taskId);
  if (!task) return false;
  
  let newContent = content;
  
  // Build updated task line
  const due = updates.dueDate ? `| due: ${updates.dueDate}` : task.dueDate ? `| due: ${task.dueDate}` : "";
  const tagStr = updates.tags?.length ? `| tags: ${updates.tags.join(", ")}` : task.tags.length ? `| tags: ${task.tags.join(", ")}` : "";
  const descStr = updates.description || task.description ? `| desc: ${updates.description || task.description || ""}` : "";
  const assigned = updates.assigned || task.assigned;
  const priority = updates.priority || task.priority;
  const text = updates.text || task.text;
  
  const oldLine = `- [${task.completed ? "x" : " "}] ${task.priority}: ${task.text} (assigned: ${task.assigned})`;
  const newLine = `- [${task.completed ? "x" : " "}] ${priority}: ${text} (assigned: ${assigned})${due}${tagStr}${descStr}`;
  
  newContent = newContent.replace(oldLine, newLine);
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

export function getTagColor(tag: string): string {
  const colors = [
    "bg-blue-900/50 text-blue-300 border-blue-700",
    "bg-purple-900/50 text-purple-300 border-purple-700",
    "bg-pink-900/50 text-pink-300 border-pink-700",
    "bg-orange-900/50 text-orange-300 border-orange-700",
    "bg-teal-900/50 text-teal-300 border-teal-700",
  ];
  const hash = tag.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
  return colors[hash % colors.length];
}
