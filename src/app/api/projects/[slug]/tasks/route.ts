import { NextRequest, NextResponse } from "next/server";
import { getProject, addTask, updateTask, deleteTask, logTaskCreated, logTaskCompleted } from "@/lib/projects";

// GET all tasks for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const project = getProject(slug);
  
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  
  return NextResponse.json({
    project: project.name,
    slug: project.slug,
    tasks: project.tasks,
    summary: {
      total: project.tasks.length,
      pending: project.tasks.filter(t => !t.completed).length,
      completed: project.tasks.filter(t => t.completed).length,
    },
  });
}

// POST - Create new task
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await request.json();
  
  const { text, priority, assigned, dueDate, tags, description } = body;
  
  if (!text) {
    return NextResponse.json({ error: "Task text is required" }, { status: 400 });
  }
  
  const task = addTask(slug, {
    text,
    priority: priority || "MEDIUM",
    assigned: assigned || "UNASSIGNED",
    dueDate,
    tags: tags || [],
    description,
  });
  
  // Log activity
  const project = getProject(slug);
  if (project && task) {
    logTaskCreated(slug, project.name, text);
  }
  
  return NextResponse.json({ success: true, task }, { status: 201 });
}

// PUT - Update task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await request.json();
  const { taskId, ...updates } = body;
  
  if (!taskId) {
    return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
  }
  
  const task = updateTask(slug, taskId, updates);
  
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  
  return NextResponse.json({ success: true, task });
}

// DELETE - Delete task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { taskId } = await request.json();
  
  if (!taskId) {
    return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
  }
  
  const deleted = deleteTask(slug, taskId);
  
  if (!deleted) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  
  return NextResponse.json({ success: true });
}
