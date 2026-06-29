import { Request, Response, NextFunction } from 'express';
import { projectService } from '../services/project.service';

export class ProjectController {
  async list(req: Request, res: Response) {
    const projects = await projectService.listProjects(req.query.ownerId as string);
    res.json({ projects, total: projects.length });
  }

  async get(req: Request, res: Response) {
    const project = await projectService.getProject(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ project });
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.createProject(req.body);
      res.status(201).json({ project });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response) {
    const project = await projectService.updateProject(req.params.id, req.body);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ project });
  }

  async archive(req: Request, res: Response) {
    const project = await projectService.archiveProject(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ project });
  }
}

export const projectController = new ProjectController();
