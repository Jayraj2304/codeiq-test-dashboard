import { Project } from '../models/types';
import { logger } from '../utils/logger';

export class ProjectService {
  private projects: Map<string, Project> = new Map();

  async createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const project: Project = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.set(project.id, project);
    logger.info(`Project created: ${project.id}`);
    return project;
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async listProjects(ownerId?: string): Promise<Project[]> {
    let projects = Array.from(this.projects.values());
    if (ownerId) projects = projects.filter(p => p.ownerId === ownerId);
    return projects;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const existing = this.projects.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.projects.set(id, updated);
    return updated;
  }

  async archiveProject(id: string): Promise<Project | undefined> {
    return this.updateProject(id, { status: 'archived' });
  }
}

export const projectService = new ProjectService();
