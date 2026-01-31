import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const PROJECTS_DIR = path.join(process.env.HOME || "/home/xecutor", "dev", "projects");
const ACTIVE_DIR = path.join(PROJECTS_DIR, "active");

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function GET() {
  const projects: any[] = [];
  
  if (fs.existsSync(ACTIVE_DIR)) {
    const files = fs.readdirSync(ACTIVE_DIR).filter(f => f.endsWith(".md"));
    for (const file of files) {
      const content = fs.readFileSync(path.join(ACTIVE_DIR, file), "utf-8");
      const descMatch = content.match(/\*\*Description:\*\*\s*(.+)/);
      const tasks = [];
      const taskRegex = /- \[([ x])\] (HIGH|MEDIUM|LOW): (.+?) \(assigned: (\w+)\)/g;
      let match;
      while ((match = taskRegex.exec(content)) !== null) {
        tasks.push({
          id: tasks.length + 1,
          text: match[3],
          priority: match[2],
          assigned: match[4],
          completed: match[1] === "x"
        });
      }
      projects.push({
        name: file.replace(".md", "").replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
        slug: file.replace(".md", ""),
        description: descMatch ? descMatch[1] : "",
        pending: tasks.filter((t: any) => !t.completed).length,
        completed: tasks.filter((t: any) => t.completed).length
      });
    }
  }
  
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const { name, description, action, slug, task, priority } = await request.json();
  
  if (!fs.existsSync(ACTIVE_DIR)) {
    fs.mkdirSync(ACTIVE_DIR, { recursive: true });
  }
  
  if (action === "create") {
    const fileName = `${slugify(name)}.md`;
    const filePath = path.join(ACTIVE_DIR, fileName);
    
    const md = `# Project: ${name}\n\n`;
    md += `**Description:** ${description}\n`;
    md += `**Created:** ${new Date().toISOString().split("T")[0]}\n`;
    md += `**Status:** active\n\n`;
    md += `## Tasks\n\n`;
    md += `## Completed\n`;
    
    fs.writeFileSync(filePath, md);
    return NextResponse.json({ success: true, slug: fileName.replace(".md", "") });
  }
  
  if (action === "addTask" && slug) {
    const filePath = path.join(ACTIVE_DIR, `${slug}.md`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const newTask = `- [ ] ${priority}: ${task} (assigned: CLAWD)\n`;
      const newContent = content.replace("## Tasks", `## Tasks\n${newTask}`);
      fs.writeFileSync(filePath, newContent);
      return NextResponse.json({ success: true });
    }
  }
  
  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
