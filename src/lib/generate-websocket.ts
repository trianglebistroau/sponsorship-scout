/**
 * WebSocket Generate service
 * Endpoint: /ws/generate/{session_id}
 *
 * In dev: connect directly to backend (ws://localhost:8000)
 */

export type GenerateWSMessage =
  | { type: "connected"; message?: string }
  | { type: "token"; content?: string; node?: string }
  | { type: "node_complete"; node?: string; state?: any }
  | { type: "complete"; message?: string }
  | { type: "error"; message?: string };

export interface GenerateWebSocketOptions {
  sessionId: string;
  onToken?: (chunk: string, node?: string) => void;
  onNodeComplete?: (node?: string, state?: any) => void;
  onComplete?: (message?: string) => void;
  onError?: (message: string) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export class GenerateWebSocket {
  private ws: WebSocket | null = null;
  private opts: GenerateWebSocketOptions;

  constructor(opts: GenerateWebSocketOptions) {
    this.opts = opts;
  }

  connect() {
    const { sessionId } = this.opts;

    const isDev =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");

    let wsUrl: string;
    if (isDev) {
      wsUrl = `ws://localhost:8000/ws/generate/${sessionId}`;
    } else {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      wsUrl = `${protocol}//${host}/ws/generate/${sessionId}`;
    }

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      this.opts.onOpen?.();
    };

    this.ws.onmessage = (event) => {
      let msg: GenerateWSMessage | null = null;
      try {
        msg = JSON.parse(event.data as string);
      } catch {
        // If backend ever sends plain text, treat as token
        this.opts.onToken?.(String(event.data));
        return;
      }

      switch (msg.type) {
        case "token":
          if (msg.content) this.opts.onToken?.(msg.content, msg.node);
          break;
        case "node_complete":
          this.opts.onNodeComplete?.(msg.node, msg.state);
          break;
        case "complete":
          this.opts.onComplete?.(msg.message);
          break;
        case "error":
          this.opts.onError?.(msg.message || "Unknown generate error");
          break;
        case "connected":
        default:
          // ignore
          break;
      }
    };

    this.ws.onerror = () => {
      this.opts.onError?.("WebSocket connection error");
    };

    this.ws.onclose = () => {
      this.opts.onClose?.();
    };
  }

  start() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "start" }));
    } else {
      this.opts.onError?.("WebSocket is not connected");
    }
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
  }

  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}