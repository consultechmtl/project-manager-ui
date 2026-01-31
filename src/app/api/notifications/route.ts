import { NextRequest, NextResponse } from "next/server";
import { getProjects } from "@/lib/projects";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const includeUpcoming = searchParams.get("upcoming") === "true";
  
  const projects = getProjects();
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const notifications: any[] = [];
  
  for (const project of projects) {
    for (const task of project.tasks) {
      if (task.completed) continue;
      
      // Due today or overdue
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        if (dueDate <= now) {
          notifications.push({
            id: `overdue-${project.slug}-${task.id}`,
            type: "overdue",
            priority: "HIGH",
            project: project.name,
            projectSlug: project.slug,
            taskId: task.id,
            task: task.text,
            dueDate: task.dueDate,
            assignee: task.assigned,
            message: `Task "${task.text}" is overdue`,
            daysOverdue: Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)),
          });
        } else if (dueDate <= weekFromNow && includeUpcoming) {
          notifications.push({
            id: `due-soon-${project.slug}-${task.id}`,
            type: "due_soon",
            priority: task.priority === "HIGH" ? "HIGH" : "MEDIUM",
            project: project.name,
            projectSlug: project.slug,
            taskId: task.id,
            task: task.text,
            dueDate: task.dueDate,
            assignee: task.assigned,
            daysUntilDue: Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
            message: `Task "${task.text}" due in ${Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days`,
          });
        }
      }
      
      // Assigned to me
      if (task.assigned && task.assigned !== "UNASSIGNED") {
        notifications.push({
          id: `assigned-${project.slug}-${task.id}`,
          type: "assigned",
          priority: task.priority,
          project: project.name,
          projectSlug: project.slug,
          taskId: task.id,
          task: task.text,
          assignee: task.assigned,
          message: `You were assigned to "${task.text}"`,
        });
      }
    }
  }
  
  // Sort by priority
  const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  notifications.sort((a, b) => {
    if (priorityOrder[a.priority as keyof typeof priorityOrder] !== priorityOrder[b.priority as keyof typeof priorityOrder]) {
      return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
    }
    return 0;
  });
  
  return NextResponse.json({
    count: notifications.length,
    notifications,
    summary: {
      overdue: notifications.filter(n => n.type === "overdue").length,
      dueSoon: notifications.filter(n => n.type === "due_soon").length,
      assigned: notifications.filter(n => n.type === "assigned").length,
    },
  });
}

export async function POST(request: NextRequest) {
  // Mark notification as read
  const body = await request.json();
  const { notificationId } = body;
  
  return NextResponse.json({ success: true, notificationId });
}
