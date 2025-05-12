import { IncomingMessage } from "http";
import { WebSocket, WebSocketServer } from "ws";

import { Logger } from "../lib/Logger";

class ViewerWebSocketService {
  private viewerWSS: WebSocketServer;
  private viewersPerSession = new Map<string, Set<WebSocket>>();

  constructor() {
    this.viewerWSS = new WebSocketServer({ noServer: true });

    this.viewerWSS.on("connection", (ws: WebSocket, req: IncomingMessage, sessionId: string) => {
      if (!sessionId) return;

      // Register viewer
      if (!this.viewersPerSession.has(sessionId)) {
        this.viewersPerSession.set(sessionId, new Set());
      }

      this.viewersPerSession.get(sessionId)!.add(ws);

      Logger.info(`Viewer connected on session ${sessionId}`);

      ws.on("close", () => {
        const viewers = this.viewersPerSession.get(sessionId);
        if (viewers) {
          viewers.delete(ws);
          Logger.info(`Viewer disconnected on session ${sessionId}`);
          if (viewers.size === 0) {
            this.viewersPerSession.delete(sessionId);
            Logger.info(`No viewers on session ${sessionId}; session deleted`);
          }
        }
      });
    });
  }

  public handleUpgrade(req: IncomingMessage, socket: any, head: Buffer) {
    const url = req.url || "";
    if (url.startsWith("/ws/view/")) {
      const sessionId = url.split("/").pop();
      if (!sessionId) return;

      this.viewerWSS.handleUpgrade(req, socket, head, (ws) => {
        this.viewerWSS.emit("connection", ws, req, sessionId);
      });
    }
  }

  public broadcastToViewers(sessionId: string, message: any) {
    const viewers = this.viewersPerSession.get(sessionId);
    if (!viewers) return;

    const payload = typeof message === "string" ? message : JSON.stringify(message);

    for (const client of viewers) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }
}

export default new ViewerWebSocketService();
