import { WebSocketServer, WebSocket, OPEN } from "ws";
import { v4 as uuidv4 } from "uuid";
import http from "http";

import { Logger } from "../lib/Logger";
import { BusinessLogicError, ErrorCode } from "../lib/Exceptions";

class WebSocketService {
  private wss: WebSocketServer | null = null;
  private sessions = new Map<string, WebSocket>();
  private MAX_SESSIONS = 4;

  public Init(server: http.Server){
    this.wss = new WebSocketServer({server});
    this.wss.on('connection', this.HandleConnection.bind(this));
  }

  private HandleConnection(ws: WebSocket){
    if (this.sessions.size >= this.MAX_SESSIONS) {
      ws.send(JSON.stringify({ error: "Session limit reached" }));
      ws.close();
      return;
    }

    const sessionId = uuidv4();
    this.sessions.set(sessionId, ws);
    ws.send(sessionId);
    Logger.info(`Session ${sessionId} established`);

    ws.on('close', () => {
      this.sessions.delete(sessionId);
      Logger.info(`Session ${sessionId} closed`);
    });
  }

  public SendMessageToSession(sessionId: string, message: string) {
    const ws = this.sessions.get(sessionId);

    if(!ws || ws.readyState !== OPEN) {
      throw new BusinessLogicError({
        errorMessage: "Session closed or not found",
        errorCode: ErrorCode.WEBSOCKET_SESSION_NOT_FOUND
      });
    }

    ws.send(message);

    return message;
  }

  public HasSession(sessionId: string) {
    return this.sessions.has(sessionId);
  }

  public GetAllSessions() {
    const activeSessions = Object.keys(this.sessions);
    return { sessions: activeSessions }
  }
}

export default new WebSocketService();