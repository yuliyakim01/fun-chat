type MessageHandler = (data: any) => void;

export class WebSocketService {
  private socket: WebSocket;
  private messageHandlers: MessageHandler[] = [];
  private messageQueue: object[] = [];
  private isConnected = false;

  constructor(private url: string) {
    this.socket = new WebSocket(url);
    this.initializeEvents();
  }

  private initializeEvents(): void {
    this.socket.addEventListener('open', () => {
      console.log('[WS] Connected to server');
      this.isConnected = true;

      // Flush any queued messages
      this.messageQueue.forEach((msg) => this.send(msg));
      this.messageQueue = [];
    });

    this.socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      console.log('[WS] Received:', data);
      this.messageHandlers.forEach((handler) => handler(data));
    });

    this.socket.addEventListener('close', () => {
      console.warn('[WS] Connection closed');
      this.isConnected = false;
    });

    this.socket.addEventListener('error', (error) => {
      console.error('[WS] Error:', error);
    });
  }

  public send(data: object): void {
    if (this.isConnected && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn('[WS] Not connected yet, queueing message:', data);
      this.messageQueue.push(data);
    }
  }

  public onMessage(handler: MessageHandler): void {
    this.messageHandlers.push(handler);
  }

  public removeOnMessage(handler: MessageHandler): void {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }
}

export const ws = new WebSocketService('ws://localhost:4000');
