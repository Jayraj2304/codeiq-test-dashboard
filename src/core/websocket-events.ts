import { WebSocketMessage, WebSocketClient, wsManager } from './websocket';
import { eventBus, EVENTS } from './events';
import { logger } from '../utils/logger';

export function initializeWebSocketEvents(): void {
  wsManager.on('subscribe', (message, client) => {
    const { channel } = message.payload as { channel: string };
    if (channel) {
      wsManager.joinRoom(client.id, channel);
      wsManager.sendMessage(client, {
        type: 'subscribed',
        payload: { channel },
        timestamp: new Date(),
      });
    }
  });

  wsManager.on('unsubscribe', (message, client) => {
    const { channel } = message.payload as { channel: string };
    if (channel) {
      wsManager.leaveRoom(client.id, channel);
      wsManager.sendMessage(client, {
        type: 'unsubscribed',
        payload: { channel },
        timestamp: new Date(),
      });
    }
  });

  wsManager.on('ping', (_, client) => {
    wsManager.sendMessage(client, {
      type: 'pong',
      payload: {},
      timestamp: new Date(),
    });
  });

  eventBus.on(EVENTS.TASK_CREATED, (payload) => {
    wsManager.broadcastToRoom('tasks', {
      type: 'task:created',
      payload,
      timestamp: new Date(),
    });
  });

  eventBus.on(EVENTS.TASK_UPDATED, (payload) => {
    const { projectId } = payload as any;
    wsManager.broadcastToRoom('tasks', {
      type: 'task:updated',
      payload,
      timestamp: new Date(),
    });
    if (projectId) {
      wsManager.broadcastToRoom(`project:${projectId}`, {
        type: 'task:updated',
        payload,
        timestamp: new Date(),
      });
    }
  });

  eventBus.on(EVENTS.TASK_COMPLETED, (payload) => {
    wsManager.broadcastToRoom('tasks', {
      type: 'task:completed',
      payload,
      timestamp: new Date(),
    });
  });

  eventBus.on(EVENTS.TASK_DELETED, (payload) => {
    wsManager.broadcastToRoom('tasks', {
      type: 'task:deleted',
      payload,
      timestamp: new Date(),
    });
  });

  logger.info('WebSocket event handlers initialized');
}
