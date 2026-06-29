import { Task } from '../models/types';

export interface SearchFilters {
  query?: string;
  status?: Task['status'][];
  priority?: Task['priority'][];
  assigneeId?: string;
  projectId?: string;
  tags?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
  dueAfter?: Date;
  dueBefore?: Date;
  estimatedHoursMin?: number;
  estimatedHoursMax?: number;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class TaskSearchService {
  private tasks: Map<string, Task> = new Map();

  indexTask(task: Task): void {
    this.tasks.set(task.id, task);
  }

  removeTask(id: string): void {
    this.tasks.delete(id);
  }

  search(filters: SearchFilters, page = 1, pageSize = 20): SearchResult<Task> {
    let results = Array.from(this.tasks.values());

    if (filters.query) {
      const q = filters.query.toLowerCase();
      results = results.filter(
        t =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    if (filters.status?.length) {
      results = results.filter(t => filters.status!.includes(t.status));
    }

    if (filters.priority?.length) {
      results = results.filter(t => filters.priority!.includes(t.priority));
    }

    if (filters.assigneeId) {
      results = results.filter(t => t.assigneeId === filters.assigneeId);
    }

    if (filters.projectId) {
      results = results.filter(t => t.projectId === filters.projectId);
    }

    if (filters.tags?.length) {
      results = results.filter(t =>
        filters.tags!.some(tag => t.tags.includes(tag))
      );
    }

    if (filters.createdAfter) {
      results = results.filter(t => t.createdAt >= filters.createdAfter!);
    }

    if (filters.createdBefore) {
      results = results.filter(t => t.createdAt <= filters.createdBefore!);
    }

    if (filters.dueAfter) {
      results = results.filter(
        t => t.dueDate !== null && t.dueDate >= filters.dueAfter!
      );
    }

    if (filters.dueBefore) {
      results = results.filter(
        t => t.dueDate !== null && t.dueDate <= filters.dueBefore!
      );
    }

    if (filters.estimatedHoursMin !== undefined) {
      results = results.filter(
        t => t.estimatedHours !== null && t.estimatedHours! >= filters.estimatedHoursMin!
      );
    }

    if (filters.estimatedHoursMax !== undefined) {
      results = results.filter(
        t => t.estimatedHours !== null && t.estimatedHours! <= filters.estimatedHoursMax!
      );
    }

    const total = results.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const items = results.slice(start, start + pageSize);

    return { items, total, page, pageSize, totalPages };
  }
}

export const taskSearchService = new TaskSearchService();
