import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { taskService } from '../services/task.service';

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000),
  status: z.enum(['todo', 'in_progress', 'review', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  assigneeId: z.string().uuid().nullable().optional(),
  projectId: z.string().uuid(),
  dueDate: z.string().datetime().nullable().optional(),
  estimatedHours: z.number().positive().nullable().optional(),
  tags: z.array(z.string()).default([]),
});

export class TaskController {
  async list(req: Request, res: Response) {
    const { status, assigneeId, projectId } = req.query;
    const tasks = await taskService.listTasks({
      status: status as any,
      assigneeId: assigneeId as string,
      projectId: projectId as string,
    });
    res.json({ tasks, total: tasks.length });
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.getTask(req.params.id);
      if (!task) return res.status(404).json({ error: 'Task not found' });
      res.json({ task });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createTaskSchema.parse(req.body);
      const task = await taskService.createTask(data);
      res.status(201).json({ task });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.updateTask(req.params.id, req.body);
      if (!task) return res.status(404).json({ error: 'Task not found' });
      res.json({ task });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await taskService.deleteTask(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Task not found' });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async metrics(req: Request, res: Response) {
    const metrics = await taskService.getTaskMetrics(req.params.projectId);
    res.json({ metrics });
  }
}

export const taskController = new TaskController();
