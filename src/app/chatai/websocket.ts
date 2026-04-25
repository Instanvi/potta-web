import Cookies from 'js-cookie';

export interface WebSocketResponse {
  message: string;
  data: any;
  source?: 'potta' | 'fpa' | null;
  type?: 'actual' | 'forecast' | null;
}

export interface WebSocketError {
  message: string;
  error_type: string;
}

export interface WebSocketMessage {
  user_session: string;
  user_auth_token: string;
  user_prompt: string;
}

export interface WebSocketCallbacks {
  onOpen?: () => void;
  onMessage?: (response: WebSocketResponse | WebSocketError) => void;
  onError?: (error: Event) => void;
  onClose?: () => void;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private callbacks: WebSocketCallbacks = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(url: string = 'wss://tribu.dev.instanvi.com/livra/') {
    this.url = url;
  }

  connect(callbacks: WebSocketCallbacks) {
    this.callbacks = callbacks;
    this.createConnection();
  }

  private createConnection() {
    try {
      console.log('🔗 Attempting to connect to WebSocket:', this.url);
      this.socket = new WebSocket(this.url);
      this.setupEventHandlers();
    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      this.handleError(error as Event);
    }
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.onopen = () => {
      console.log('✅ WebSocket connected to:', this.url);
      this.reconnectAttempts = 0;
      this.callbacks.onOpen?.();
    };

    this.socket.onmessage = (event) => {
      try {
        const response: WebSocketResponse | WebSocketError = JSON.parse(
          event.data
        );
        this.callbacks.onMessage?.(response);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        this.callbacks.onError?.(error as Event);
      }
    };

    this.socket.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      console.error('❌ Failed to connect to:', this.url);
      this.callbacks.onError?.(error);
    };

    this.socket.onclose = (event) => {
      console.log(
        '🔌 WebSocket disconnected. Code:',
        event.code,
        'Reason:',
        event.reason,
        'URL:',
        this.url
      );
      this.callbacks.onClose?.();

      // Attempt to reconnect if not a normal closure
      if (
        event.code !== 1000 &&
        this.reconnectAttempts < this.maxReconnectAttempts
      ) {
        this.attemptReconnect();
      }
    };
  }

  private attemptReconnect() {
    this.reconnectAttempts++;
    console.log(
      `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
    );

    setTimeout(() => {
      this.createConnection();
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  sendMessage(userSession: string, userAuthToken: string, userPrompt: string) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    const payload: WebSocketMessage = {
      user_session: userSession,
      user_auth_token: userAuthToken,
      user_prompt: userPrompt,
    };

    this.socket.send(JSON.stringify(payload));
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  disconnect() {
    if (this.socket) {
      this.socket.close(1000, 'User initiated disconnect');
      this.socket = null;
    }
  }

  private handleError(error: Event) {
    console.error('WebSocket service error:', error);
    this.callbacks.onError?.(error);
  }
}

// Helper function to get auth token from cookies or context
export const getAuthToken = (token?: string): string => {
  return token || Cookies.get('auth_token') || '';
};

// Helper function to get user session from user object
export const getUserSession = (user: any): string => {
  return user?.id || user?.email || user?.name || 'unknown_user';
};

// Create and export a singleton instance
export const webSocketService = new WebSocketService();

export default WebSocketService;
