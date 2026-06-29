import { TaskService } from '../src/services/task.service';

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    service = new TaskService();
  });

  describe('createTask', () => {
    it('should create a task with generated id', async () => {
      const task = await service.createTask({
        title: 'Test Task',
        description: 'A test task',
        status: 'todo',
        priority: 'medium',
        assigneeId: null,
        projectId: 'proj-1',
        dueDate: null,
        estimatedHours: null,
        actualHours: null,
        tags: [],
      });

      expect(task.id).toBeDefined();
      expect(task.title).toBe('Test Task');
      expect(task.status).toBe('todo');
    });
  });

  describe('listTasks', () => {
    it('should filter tasks by status', async () => {
      await service.createTask({
        title: 'Todo Task',
        description: '',
        status: 'todo',
        priority: 'low',
        assigneeId: null,
        projectId: 'proj-1',
        dueDate: null,
        estimatedHours: null,
        actualHours: null,
        tags: [],
      });
      await service.createTask({
        title: 'Done Task',
        description: '',
        status: 'done',
        priority: 'high',
        assigneeId: null,
        projectId: 'proj-1',
        dueDate: null,
        estimatedHours: null,
        actualHours: null,
        tags: [],
      });

      const todoTasks = await service.listTasks({ status: 'todo' });
      expect(todoTasks).toHaveLength(1);
      expect(todoTasks[0].title).toBe('Todo Task');
    });
  });

  describe('getTaskMetrics', () => {
    it('should calculate correct metrics', async () => {
      await service.createTask({
        title: 'Task 1',
        description: '',
        status: 'done',
        priority: 'high',
        assigneeId: null,
        projectId: 'proj-1',
        dueDate: null,
        estimatedHours: 5,
        actualHours: 7,
        tags: [],
      });
      await service.createTask({
        title: 'Task 2',
        description: '',
        status: 'in_progress',
        priority: 'low',
        assigneeId: null,
        projectId: 'proj-1',
        dueDate: null,
        estimatedHours: 3,
        actualHours: null,
        tags: [],
      });

      const metrics = await service.getTaskMetrics('proj-1');
      expect(metrics.total).toBe(2);
      expect(metrics.byStatus.done).toBe(1);
      expect(metrics.byStatus.inProgress).toBe(1);
    });
  });
});
