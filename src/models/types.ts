export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'member' | 'viewer';
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigneeId: string | null;
  projectId: string;
  dueDate: Date | null;
  estimatedHours: number | null;
  actualHours: number | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  status: 'active' | 'archived' | 'completed';
  startDate: Date;
  endDate: Date | null;
  budget: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: 'task' | 'project' | 'user';
  entityId: string;
  userId: string;
  changes: Record<string, { old: unknown; new: unknown }>;
  timestamp: Date;
}
