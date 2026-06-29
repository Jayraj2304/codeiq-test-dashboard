import { container, createToken } from '../core/container';
import { Task, AuditLog } from '../models/types';
import { logger } from '../utils/logger';

export interface TaskRepository {
  create(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;
  findById(id: string): Promise<Task | undefined>;
  findAll(filters: { status?: string; assigneeId?: string; projectId?: string }): Promise<Task[]>;
  update(id: string, data: Partial<Task>): Promise<Task | undefined>;
  delete(id: string): Promise<boolean>;
  count(filters: { projectId?: string; status?: string }): Promise<number>;
}

export const TASK_REPOSITORY = createToken<TaskRepository>('TaskRepository');

export class InMemoryTaskRepository implements TaskRepository {
  private tasks = new Map<string, Task>();

  async create(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const task: Task = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tasks.set(task.id, task);
    return task;
  }

  async findById(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async findAll(filters: { status?: string; assigneeId?: string; projectId?: string }): Promise<Task[]> {
    let tasks = Array.from(this.tasks.values());
    if (filters.status) tasks = tasks.filter(t => t.status === filters.status);
    if (filters.assigneeId) tasks = tasks.filter(t => t.assigneeId === filters.assigneeId);
    if (filters.projectId) tasks = tasks.filter(t => t.projectId === filters.projectId);
    return tasks;
  }

  async update(id: string, data: Partial<Task>): Promise<Task | undefined> {
    const existing = this.tasks.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, updatedAt: new Date() };
    this.tasks.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async count(filters: { projectId?: string; status?: string }): Promise<number> {
    const tasks = await this.findAll(filters);
    return tasks.length;
  }
}

container.registerFactory(TASK_REPOSITORY, () => new InMemoryTaskRepository());
