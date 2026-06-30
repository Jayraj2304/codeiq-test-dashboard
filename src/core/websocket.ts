import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';
import { logger } from '../utils/logger';

export interface WebSocketMessage {
  type: string;
  payload: unknown;
  timestamp: Date;
}

export type MessageHandler = (message: WebSocketMessage, client: WebSocketClient) => void;

export interface WebSocketClient {
  id: string;
  ws: WebSocket;
  userId?: string;
  rooms: Set<string>;
  connectedAt: Date;
  lastPing: Date;
}

export class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients = new Map<string, WebSocketClient>();
  private handlers = new Map<string, MessageHandler[]>();
  private rooms = new Map<string, Set<string>>();
  private pingInterval: NodeJS.Timeout | null = null;

  initialize(server: Server): void {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws) => {
      const client: WebSocketClient = {
        id: crypto.randomUUID(),
        ws,
        rooms: new Set(),
        connectedAt: new Date(),
        lastPing: new Date(),
      };

      this.clients.set(client.id, client);
      logger.info(`WebSocket client connected: ${client.id}`);

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString()) as WebSocketMessage;
          this.handleMessage(message, client);
        } catch (error) {
          logger.error('Invalid WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        this.removeClient(client.id);
        logger.info(`WebSocket client disconnected: ${client.id}`);
      });

      ws.on('pong', () => {
        client.lastPing = new Date();
      });

      this.sendMessage(client, {
        type: 'connected',
        payload: { clientId: client.id },
        timestamp: new Date(),
      });
    });

    this.pingInterval = setInterval(() => {
      const timeout = Date.now() - 30000;
      for (const [id, client] of this.clients) {
        if (client.lastPing.getTime() < timeout) {
          logger.debug(`Client ${id} timed out, disconnecting`);
          client.ws.terminate();
          this.removeClient(id);
        } else {
          client.ws.ping();
        }
      }
    }, 15000);

    logger.info('WebSocket server initialized');
  }

  private handleMessage(message: WebSocketMessage, client: WebSocketClient): void {
    const handlers = this.handlers.get(message.type) || [];
    handlers.forEach((handler) => handler(message, client));
  }

  private removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.rooms.forEach((room) => {
        const roomClients = this.rooms.get(room);
        if (roomClients) {
          roomClients.delete(clientId);
          if (roomClients.size === 0) {
            this.rooms.delete(room);
          }
        }
      });
      this.clients.delete(clientId);
    }
  }

  on(type: string, handler: MessageHandler): void {
    const existing = this.handlers.get(type) || [];
    existing.push(handler);
    this.handlers.set(type, existing);
  }

  joinRoom(clientId: string, room: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.rooms.add(room);
      let roomClients = this.rooms.get(room);
      if (!roomClients) {
        roomClients = new Set();
        this.rooms.set(room, roomClients);
      }
      roomClients.add(clientId);
      logger.debug(`Client ${clientId} joined room ${room}`);
    }
  }

  leaveRoom(clientId: string, room: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.rooms.delete(room);
      const roomClients = this.rooms.get(room);
      if (roomClients) {
        roomClients.delete(clientId);
        if (roomClients.size === 0) {
          this.rooms.delete(room);
        }
      }
    }
  }

  broadcastToRoom(room: string, message: WebSocketMessage): void {
    const roomClients = this.rooms.get(room);
    if (roomClients) {
      roomClients.forEach((clientId) => {
        const client = this.clients.get(clientId);
        if (client) {
          this.sendMessage(client, message);
        }
      });
    }
  }

  broadcast(message: WebSocketMessage): void {
    this.clients.forEach((client) => {
      this.sendMessage(client, message);
    });
  }

  private sendMessage(client: WebSocketClient, message: WebSocketMessage): void {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  getClientCount(): number {
    return this.clients.size;
  }

  getRoomCount(): number {
    return this.rooms.size;
  }

  shutdown(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    this.clients.forEach((client) => {
      client.ws.close(1001, 'Server shutting down');
    });
    this.clients.clear();
    this.rooms.clear();
    if (this.wss) {
      this.wss.close();
    }
  }
}

export const wsManager = new WebSocketManager();
