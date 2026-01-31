import { NextRequest, NextResponse } from "next/server";
import { getProjects, addProject, logProjectCreated } from "@/lib/projects";

// GET all projects
export async function GET(request: NextRequest) {
  const projects = getProjects();
  
  return NextResponse.json({
    total: projects.length,
    active: projects.filter(p => p.status === "active").length,
    completed: projects.filter(p => p.status === "completed").length,
    projects,
  });
}

// POST - Create new project
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, description, status } = body;
  
  if (!name) {
    return NextResponse.json({ error: "Project name is required" }, { status: 400 });
  }
  
  const project = addProject({
    name,
    description: description || "",
    status: status || "active",
  });
  
  // Log activity
  if (project) {
    logProjectCreated(name);
  }
  
  return NextResponse.json({ success: true, project }, { status: 201 });
}
