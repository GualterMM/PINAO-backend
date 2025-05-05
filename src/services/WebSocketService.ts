import { WebSocketServer, WebSocket, OPEN } from "ws";
import { v4 as uuidv4 } from "uuid";
import http from "http";

import { Logger } from "../lib/Logger";
import { BusinessLogicError, ErrorCode } from "../lib/Exceptions";

import { GameSession } from "../models/GameSession";
import { GameMessage } from "../models/GameMessage";
import { Sabotage } from "../interfaces/GlobalInterfaces";
import { GameCoordinatorService } from "./GameCoordinatorService";

class WebSocketService {
  private wss: WebSocketServer | null = null;
  private sessions = new Map<string, WebSocket>();
  private MAX_SESSIONS = 4;

  public Init(server: http.Server) {
    this.wss = new WebSocketServer({ server });
    this.wss.on('connection', this.HandleConnection.bind(this));
  }

  private HandleConnection(ws: WebSocket) {
    if (this.sessions.size >= this.MAX_SESSIONS) {
      ws.send(JSON.stringify({ error: "Session limit reached" }));
      ws.close();
      return;
    }

    const sessionId = uuidv4();
    this.sessions.set(sessionId, ws);

    // TODO: Improve this message to make it clear it's a sessionId
    ws.send(sessionId);

    const { gameState, sabotages } = GameSession.getDefaultParams();
    gameState.sessionId = sessionId;

    GameCoordinatorService.registerGameSession(sessionId, { gameState, sabotages });
    Logger.info(`Session ${sessionId} established`);

    ws.on("message", (data) => {
      try {
        const raw = JSON.parse(data.toString());
        const gameMessage = GameMessage.fromObject(raw);

        this.HandleGameClientMessage(sessionId, gameMessage);
      } catch (err) {
        ws.send(JSON.stringify({ error: "Invalid GameMessage format", details: err }))
      }
    });

    ws.on("error", (error) => {
      Logger.error(`Session ${sessionId} (${ws.url}) error: ${error.message}`);
    });

    ws.on("close", () => {
      this.sessions.delete(sessionId);
      GameCoordinatorService.revokeGameSession(sessionId);

      Logger.info(`Session ${sessionId} (${ws.url}) closed`);
    });
  }

  private HandleGameClientMessage(sessionId: string, message: GameMessage) {
    GameCoordinatorService.updateGameSessionState(sessionId, message);

    const availableSabotagePoolVersion = message.getGameState().availableSabotagePoolVersion;
    const canReceiveSabotage = message.getGameState().canReceiveSabotage;
    const availableSabotages = message.getSabotages()?.availableSabotagePool;
    let hasSentMessage = false;
    
    // Check if session is over, for saving the statistics
    if (GameCoordinatorService.isSessionOver(sessionId)){
      // TODO: Upload statistics to database
    }

    // Check if session is active, for handling further actions
    if (!GameCoordinatorService.isSessionActive(sessionId)) {
      return;
    }

    // Consume available sabotage pool, if applicable
    if(
      typeof availableSabotagePoolVersion !== "undefined"
      && (availableSabotagePoolVersion !== GameCoordinatorService.getAvailableSabotagesVersion(sessionId))
      && availableSabotages
    ) {
      GameCoordinatorService.setAvailableSabotages(sessionId, availableSabotages, availableSabotagePoolVersion);
    }

    // Send sabotages in queue if game client can receive them
    if(typeof canReceiveSabotage !== "undefined" && canReceiveSabotage) {
      GameCoordinatorService.sendSabotages(sessionId);
      this.SendResponseToSession(sessionId, true);
      hasSentMessage = true;
    }

    // Send current game coordinator state as response
    if (!hasSentMessage) {
      this.SendResponseToSession(sessionId, false);
    }
  }

  private SendResponseToSession(sessionId: string, sendSabotages: boolean) {
    const ws = this.sessions.get(sessionId);

    if (!ws || ws.readyState !== OPEN) {
      throw new BusinessLogicError({
        errorMessage: "Session closed or not found",
        errorCode: ErrorCode.WEBSOCKET_SESSION_NOT_FOUND
      });
    }

    const gameSession = GameCoordinatorService.getGameSession(sessionId);
    const gameMessage = new GameMessage(gameSession.getGameState(), sendSabotages ? gameSession.getSabotages() : undefined);

    ws.send(JSON.stringify(gameMessage.toObject()));
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