import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { taskSearchService, SearchFilters } from '../services/task-search.service';

const searchSchema = z.object({
  query: z.string().optional(),
  status: z.array(z.enum(['todo', 'in_progress', 'review', 'done'])).optional(),
  priority: z.array(z.enum(['low', 'medium', 'high', 'critical'])).optional(),
  assigneeId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export class TaskSearchController {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = searchSchema.parse(req.query);
      const { page, pageSize, ...searchFilters } = filters;
      const result = taskSearchService.search(searchFilters as SearchFilters, page, pageSize);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const taskSearchController = new TaskSearchController();
