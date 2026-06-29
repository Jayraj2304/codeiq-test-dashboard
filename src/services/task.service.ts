import { Task, AuditLog } from '../models/types';
import { logger } from '../utils/logger';

export class TaskService {
  private tasks: Map<string, Task> = new Map();
  private auditLogs: AuditLog[] = [];

  async createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const task: Task = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tasks.set(task.id, task);
    this.logAudit('create', 'task', task.id, {}, data);
    logger.info(`Task created: ${task.id}`);
    return task;
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async listTasks(filters: { status?: Task['status']; assigneeId?: string; projectId?: string }): Promise<Task[]> {
    let tasks = Array.from(this.tasks.values());
    if (filters.status) tasks = tasks.filter(t => t.status === filters.status);
    if (filters.assigneeId) tasks = tasks.filter(t => t.assigneeId === filters.assigneeId);
    if (filters.projectId) tasks = tasks.filter(t => t.projectId === filters.projectId);
    return tasks;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const existing = this.tasks.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.tasks.set(id, updated);
    this.logAudit('update', 'task', id, existing, updated);
    return updated;
  }

  async deleteTask(id: string): Promise<boolean> {
    const existing = this.tasks.get(id);
    if (!existing) return false;
    this.tasks.delete(id);
    this.logAudit('delete', 'task', id, existing, {});
    return true;
  }

  async getTaskMetrics(projectId: string) {
    const tasks = Array.from(this.tasks.values()).filter(t => t.projectId === projectId);
    return {
      total: tasks.length,
      byStatus: {
        todo: tasks.filter(t => t.status === 'todo').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        review: tasks.filter(t => t.status === 'review').length,
        done: tasks.filter(t => t.status === 'done').length,
      },
      byPriority: {
        low: tasks.filter(t => t.priority === 'low').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        high: tasks.filter(t => t.priority === 'high').length,
        critical: tasks.filter(t => t.priority === 'critical').length,
      },
      avgEstimatedHours: tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0) / tasks.length,
      avgActualHours: tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0) / tasks.length,
    };
  }

  private logAudit(action: string, entityType: 'task' | 'project' | 'user', entityId: string, oldData: unknown, newData: unknown) {
    this.auditLogs.push({
      id: crypto.randomUUID(),
      action,
      entityType,
      entityId,
      userId: 'system',
      changes: { data: { old: oldData, new: newData } },
      timestamp: new Date(),
    });
  }
}

export const taskService = new TaskService();
