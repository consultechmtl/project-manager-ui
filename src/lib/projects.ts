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

// Activity Log
export interface Activity {
  id: string;
  type: "task_created" | "task_completed" | "task_updated" | "project_created" | "comment_added";
  projectSlug: string;
  projectName: string;
  taskId?: number;
  taskText?: string;
  description: string;
  timestamp: string;
  user: string;
}

const ACTIVITY_LOG_FILE = path.join(process.env.HOME || "/home/xecutor", "dev", "projects", "activity.json");

export function getActivityLog(limit: number = 50): Activity[] {
  try {
    if (fs.existsSync(ACTIVITY_LOG_FILE)) {
      const data = JSON.parse(fs.readFileSync(ACTIVITY_LOG_FILE, "utf-8"));
      return data.slice(-limit).reverse();
    }
  } catch {
    // File doesn't exist or is corrupted
  }
  return [];
}

export function addActivity(activity: Omit<Activity, "id" | "timestamp">): Activity {
  const newActivity: Activity = {
    ...activity,
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    timestamp: new Date().toISOString(),
  };

  try {
    let activities: Activity[] = [];
    if (fs.existsSync(ACTIVITY_LOG_FILE)) {
      try {
        activities = JSON.parse(fs.readFileSync(ACTIVITY_LOG_FILE, "utf-8"));
      } catch {
        activities = [];
      }
    }
    activities.push(newActivity);
    // Keep only last 500 activities
    if (activities.length > 500) {
      activities = activities.slice(-500);
    }
    fs.writeFileSync(ACTIVITY_LOG_FILE, JSON.stringify(activities, null, 2));
  } catch {
    // Silent fail if we can't write activity log
  }

  return newActivity;
}

export function logTaskCreated(projectSlug: string, projectName: string, taskText: string, user: string = "CLAWD") {
  return addActivity({
    type: "task_created",
    projectSlug,
    projectName,
    taskText,
    description: `Created task "${taskText}"`,
    user,
  });
}

export function logTaskCompleted(projectSlug: string, projectName: string, taskText: string, user: string = "CLAWD") {
  return addActivity({
    type: "task_completed",
    projectSlug,
    projectName,
    taskText,
    description: `Completed task "${taskText}"`,
    user,
  });
}

export function logProjectCreated(projectName: string, user: string = "CLAWD") {
  return addActivity({
    type: "project_created",
    projectSlug: projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    projectName,
    description: `Created project "${projectName}"`,
    user,
  });
}

export function getActivityColor(type: Activity["type"]): string {
  switch (type) {
    case "task_created": return "bg-blue-900/50 text-blue-300 border-blue-700";
    case "task_completed": return "bg-green-900/50 text-green-300 border-green-700";
    case "task_updated": return "bg-yellow-900/50 text-yellow-300 border-yellow-700";
    case "project_created": return "bg-purple-900/50 text-purple-300 border-purple-700";
    case "comment_added": return "bg-gray-900/50 text-gray-300 border-gray-700";
    default: return "bg-gray-800 text-gray-300 border-gray-700";
  }
}

export function getActivityIcon(type: Activity["type"]): string {
  switch (type) {
    case "task_created": return "+";
    case "task_completed": return "✓";
    case "task_updated": return "↻";
    case "project_created": return "📁";
    case "comment_added": return "💬";
    default: return "•";
  }
}

// ===== PROJECT TEMPLATES =====

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tasks: Array<{
    text: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    assigned: string;
    dueDays: number;
    tags?: string[];
  }>;
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "software-launch",
    name: "Software Launch",
    description: "Complete project for launching a new software product",
    category: "Development",
    tasks: [
      { text: "Define product requirements", priority: "HIGH", assigned: "UNASSIGNED", dueDays: 1, tags: ["planning"] },
      { text: "Create technical architecture", priority: "HIGH", assigned: "UNASSIGNED", dueDays: 3, tags: ["architecture"] },
      { text: "Set up development environment", priority: "MEDIUM", assigned: "UNASSIGNED", dueDays: 5, tags: ["devops"] },
      { text: "Implement core features", priority: "HIGH", assigned: "UNASSIGNED", dueDays: 14, tags: ["development"] },
      { text: "Write unit tests", priority: "MEDIUM", assigned: "UNASSIGNED", dueDays: 18, tags: ["testing"] },
      { text: "Conduct code review", priority: "MEDIUM", assigned: "UNASSIGNED", dueDays: 20, tags: ["quality"] },
      { text: "Performance testing", priority: "MEDIUM", assigned: "UNASSIGNED", dueDays: 24, tags: ["testing"] },
      { text: "Bug fixes", priority: "HIGH", assigned: "UNASSIGNED", dueDays: 28, tags: ["bugfix"] },
      { text: "Documentation", priority: "MEDIUM", assigned: "UNASSIGNED", dueDays: 30, tags: ["docs"] },
      { text: "Deploy to staging", priority: "HIGH", assigned: "UNASSIGNED", dueDays: 32, tags: ["devops"] },
      { text: "User acceptance testing", priority: "HIGH", assigned: "UNASSIGNED", dueDays: 35, tags: ["testing"] },
      { text: "Final bug fixes", priority: "HIGH", assigned: "UNASSIGNED", dueDays: 38, tags: ["bugfix"] },
      { text: "Deploy to production", priority: "HIGH", assigned: "UNASSIGNED", dueDays: 40, tags: ["release"] },
      { text: "Post-launch monitoring", priority: "MEDIUM", assigned: "UNASSIGNED", dueDays: 42, tags: ["monitoring"] },
    ],
  },
  {
    id: "marketing-campaign",
    name: "Marketing Campaign",
    description: "End-to-end marketing campaign execution",
    category: "Marketing",
    tasks: [
      { text: "Define campaign goals and KPIs", priority: "HIGH", assigned: "UNASSIGNED", dueDays: 1, tags: ["strategy"] },
      { text: "Identify target audience", priority: "HIGH", assigned: "UNASSIGNED", dueDays: 2, tags: ["strategy"] },
      { text: "Create campaign messaging", priority: "HIGH", assigned: "UNASSIGNED", dueDays: 4, tags: ["creative"] },
      { text: "Design visual assets", priority: "MEDIUM", assigned: "UNASSIGNED", dueDays: 7, tags: ["design"] },
      { text: "Set up landing pages", priority: "MEDIUM", assigned: "UNASSIGNED", dueDays: 10, tags: ["web"] },
      { text: "Configure ad accounts", priority: "MEDIUM", assigned: "UNASSIGNED", dueDays: 12, tags: ["ads"] },
      { text: "Create content calendar", priority: "MEDIUM", assigned: "UNASSIGNED", dueDays: 14, tags: ["content"] },
      { text: "Write blog posts/articles", priority: "MEDIUM", assigned: "UNASSIGNED", dueDays: 18, tags: ["content"] },
      { text: "Create social media posts", priority: "MEDIUM", assigned: "UNASSIGNED", dueDays: 21, tags: ["social"] },
      { text: "Email sequence setup", priority: "MEDIUM", assigned: "UNASSIGNED", dueDays: 24, tags: ["email"] },
      { text: "Launch campaign", priority: "HIGH", assigned: "UNASSIGNED", dueDays: 28, tags: ["launch"] },
      { text: "Monitor and optimize ads", priority: "MEDIUM", assigned: "UNASSIGNED", dueDays: 35, tags: ["ads"] },
      { text: "Track analytics", priority: "MEDIUM", assigned: "UNASSIGNED", dueDays: 40, tags: ["analytics"] },
      { text: "Generate campaign report", priority: "HIGH", assigned: "UNASSIGNED", dueDays: 45, tags: ["reporting"] },
    ],
  },
  {
    id: "content-creation",
    name: "Content Creation",
    description: "Systematic content creation workflow",
    category: "Content",
    tasks: [
      { text: "Research topic/trends", priority: "MEDIUM", assigned: "UNASSIGNED", dueDays: 1, tags: ["research"] },
      { text: "Create content brief", priority: "MEDIUM", assigned: "UNASSIGNED", dueDays: 2, tags: ["planning"] },
      { text: "Write first draft", priority: "HIGH", assigned: "UNASSIGNED", dueDays: 5, tags: ["writing"] },
      { text: "Add images/media", priority: "MEDIUM", assigned: "UNASSIGNED", dueDays: 7, tags: ["media"] },
      { text: "SEO optimization", priority: "MEDIUM", assigned: "UNASSIGNED", dueDays: 8, tags: ["seo"] },
      { text: "Internal review", priority: "MEDIUM", assigned: "UNASSIGNED", dueDays: 10, tags: ["review"] },
      { text: "Editor review", priority: "MEDIUM", assigned: "UNASSIGNED", dueDays: 12, tags: ["review"] },
      { text: "Final revisions", priority: "MEDIUM", assigned: "UNASSIGNED", dueDays: 14, tags: ["editing"] },
      { text: "Publish content", priority: "HIGH", assigned: "UNASSIGNED", dueDays: 15, tags: ["publish"] },
      { text: "Share on social media", priority: "MEDIUM", assigned: "UNASSIGNED", dueDays: 16, tags: ["social"] },
      { text: "Track performance", priority: "MEDIUM", assigned: "UNASSIGNED", dueDays: 22, tags: ["analytics"] },
    ],
  },
  {
    id: "meeting-prep",
    name: "Meeting Preparation",
    description: "Prepare for important meetings efficiently",
    category: "Productivity",
    tasks: [
      { text: "Define meeting agenda", priority: "HIGH", assigned: "UNASSIGNED", dueDays: 0, tags: ["planning"] },
      { text: "Gather relevant documents", priority: "MEDIUM", assigned: "UNASSIGNED", dueDays: 0, tags: ["research"] },
      { text: "Review previous meeting notes", priority: "MEDIUM", assigned: "UNASSIGNED", dueDays: 0, tags: ["research"] },
      { text: "Prepare talking points", priority: "HIGH", assigned: "UNASSIGNED", dueDays: 0, tags: ["prep"] },
      { text: "Anticipate questions", priority: "MEDIUM", assigned: "UNASSIGNED", dueDays: 0, tags: ["prep"] },
      { text: "Set up presentation materials", priority: "MEDIUM", assigned: "UNASSIGNED", dueDays: 0, tags: ["presentation"] },
      { text: "Test technology/AV", priority: "MEDIUM", assigned: "UNASSIGNED", dueDays: 0, tags: ["technical"] },
      { text: "Send calendar invite/reminder", priority: "MEDIUM", assigned: "UNASSIGNED", dueDays: 1, tags: ["logistics"] },
    ],
  },
  {
    id: "weekly-review",
    name: "Weekly Review",
    description: "Regular weekly planning and review session",
    category: "Productivity",
    tasks: [
      { text: "Review last week's goals", priority: "HIGH", assigned: "UNASSIGNED", dueDays: 0, tags: ["review"] },
      { text: "Review calendar for upcoming week", priority: "MEDIUM", assigned: "UNASSIGNED", dueDays: 0, tags: ["planning"] },
      { text: "Process inbox/emails", priority: "MEDIUM", assigned: "UNASSIGNED", dueDays: 0, tags: ["admin"] },
      { text: "Update task list", priority: "HIGH", assigned: "UNASSIGNED", dueDays: 0, tags: ["planning"] },
      { text: "Set top 3 priorities for week", priority: "HIGH", assigned: "UNASSIGNED", dueDays: 0, tags: ["planning"] },
      { text: "Block time for deep work", priority: "MEDIUM", assigned: "UNASSIGNED", dueDays: 0, tags: ["time-management"] },
      { text: "Review ongoing projects", priority: "MEDIUM", assigned: "UNASSIGNED", dueDays: 0, tags: ["review"] },
      { text: "Clean up workspace/files", priority: "LOW", assigned: "UNASSIGNED", dueDays: 1, tags: ["organization"] },
    ],
  },
];

export function getTemplates(): ProjectTemplate[] {
  return PROJECT_TEMPLATES;
}

export function getTemplate(id: string): ProjectTemplate | undefined {
  return PROJECT_TEMPLATES.find(t => t.id === id);
}

export function getTemplatesByCategory(): Record<string, ProjectTemplate[]> {
  const categories: Record<string, ProjectTemplate[]> = {};
  for (const template of PROJECT_TEMPLATES) {
    if (!categories[template.category]) {
      categories[template.category] = [];
    }
    categories[template.category].push(template);
  }
  return categories;
}

// ===== PROJECT EXPORT/IMPORT =====

export function exportProjectToJSON(project: Project): string {
  return JSON.stringify({
    name: project.name,
    slug: project.slug,
    description: project.description,
    status: project.status,
    tasks: project.tasks,
    exportedAt: new Date().toISOString(),
  }, null, 2);
}

export function exportProjectToCSV(project: Project): string {
  const headers = ["ID", "Task", "Priority", "Assigned", "Due Date", "Tags", "Status", "Description"];
  const rows = project.tasks.map(task => [
    task.id.toString(),
    `"${task.text.replace(/"/g, '""')}"`,
    task.priority,
    task.assigned,
    task.dueDate || "",
    `"${(task.tags || []).join(", ")}"`,
    task.completed ? "Completed" : "Pending",
    `"${(task.description || "").replace(/"/g, '""')}"`,
  ]);
  
  return [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
}

export function exportAllProjectsToJSON(projects: Project[]): string {
  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    projects: projects.map(p => ({
      name: p.name,
      slug: p.slug,
      description: p.description,
      status: p.status,
      tasks: p.tasks,
    })),
  }, null, 2);
}

export function importProjectFromJSON(jsonString: string): Partial<Project> | null {
  try {
    const data = JSON.parse(jsonString);
    return {
      name: data.name,
      slug: data.slug,
      description: data.description,
      status: data.status || "active",
      tasks: data.tasks || [],
    };
  } catch {
    return null;
  }
}

export function createProjectFromTemplate(template: ProjectTemplate, projectName: string): Project {
  const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const today = new Date();
  const tasks = template.tasks.map((t, i) => ({
    id: i + 1,
    text: t.text,
    priority: t.priority,
    assigned: t.assigned,
    dueDate: t.dueDays === 0 ? today.toISOString().split("T")[0] : undefined,
    tags: t.tags || [],
    completed: false,
    subtasks: [],
  }));
  
  tasks.forEach((task, i) => {
    if (template.tasks[i].dueDays > 0) {
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + template.tasks[i].dueDays);
      task.dueDate = dueDate.toISOString().split("T")[0];
    }
  });
  
  return {
    name: projectName,
    slug,
    description: template.description,
    created: today.toISOString().split("T")[0],
    status: "active",
    tasks,
  };
}

// ===== PROJECT CLONING =====

export function cloneProject(sourceProject: Project, newName: string): Project {
  const slug = newName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const today = new Date().toISOString().split("T")[0];
  const tasks = sourceProject.tasks.map((t, i) => ({
    ...t,
    id: i + 1,
    completed: false,
    completedDate: undefined,
    dueDate: t.dueDate ? today : undefined,
  }));
  
  return {
    name: newName,
    slug,
    description: sourceProject.description,
    created: today,
    status: "active",
    tasks,
  };
}
