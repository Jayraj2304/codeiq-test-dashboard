export type EventHandler<T = unknown> = (data: T) => void | Promise<void>;

export interface DomainEvent {
  type: string;
  payload: unknown;
  timestamp: Date;
  source: string;
}

export class EventBus {
  private handlers = new Map<string, EventHandler[]>();

  on<T>(eventType: string, handler: EventHandler<T>): void {
    const existing = this.handlers.get(eventType) || [];
    existing.push(handler as EventHandler);
    this.handlers.set(eventType, existing);
  }

  off<T>(eventType: string, handler: EventHandler<T>): void {
    const existing = this.handlers.get(eventType) || [];
    this.handlers.set(
      eventType,
      existing.filter(h => h !== handler)
    );
  }

  async emit(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];
    await Promise.all(handlers.map(h => h(event.payload)));
  }

  async emitAsync(type: string, payload: unknown, source: string): Promise<void> {
    await this.emit({ type, payload, timestamp: new Date(), source });
  }
}

export const eventBus = new EventBus();

export const EVENTS = {
  TASK_CREATED: 'task.created',
  TASK_UPDATED: 'task.updated',
  TASK_DELETED: 'task.deleted',
  TASK_COMPLETED: 'task.completed',
  PROJECT_CREATED: 'project.created',
  PROJECT_ARCHIVED: 'project.archived',
  USER_REGISTERED: 'user.registered',
} as const;
