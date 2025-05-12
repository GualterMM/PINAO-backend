import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
import http from "http";

import { Logger } from "../lib/Logger";

import { GameSession } from "../models/GameSession";
import { GameMessage } from "../models/GameMessage";
import { GameCoordinatorService } from "./GameCoordinatorService";

class WebSocketService {
  private wss: WebSocketServer | null = null;
  private sessions = new Map<string, WebSocket>();
  private MAX_SESSIONS = 4;

  public init(server: http.Server) {
    this.wss = new WebSocketServer({ server });
    this.wss.on('connection', this.handleConnection.bind(this));
  }

  private handleConnection(ws: WebSocket) {
    if (this.sessions.size >= this.MAX_SESSIONS) {
      ws.send(JSON.stringify({ error: "Session limit reached" }));
      ws.close();
      return;
    }

    const sessionId = uuidv4();
    this.sessions.set(sessionId, ws);

    this.setupGameSession(ws, sessionId);

    ws.on("message", (data) => {
      try {
        const raw = JSON.parse(data.toString());
        const gameMessage = GameMessage.fromObject(raw);
        Logger.debug(data.toString());

        this.handleGameClientMessage(ws, sessionId, gameMessage);
      } catch (err) {
        Logger.error(`Session ${sessionId} (${ws.url}) parse error: ${err}`)
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

  private setupGameSession(ws: WebSocket, sessionId: string) {

    // Set up the game message and session
    const gameSessionParams = GameSession.getDefaultParams();
    gameSessionParams.gameState.sessionId = sessionId;
    const gameSession = new GameSession(gameSessionParams);

    // Register new game session
    GameCoordinatorService.registerGameSession(
      sessionId, 
      { 
        gameState: gameSession.getGameState(), 
        sabotages: gameSession.getSabotages() 
      }
    );

    const availableSabotagePool = GameCoordinatorService.generateSabotages(5);
    GameCoordinatorService.setAvailableSabotages(sessionId, availableSabotagePool);

    // Send session id to client
    const gameMessage = new GameMessage({ sessionId, status: "setup" }, { activeSabotagePool: [], availableSabotagePool });
    ws.send(JSON.stringify(gameMessage.toJSON()));
    Logger.info(`Session ${sessionId} established`);
  }

  private handleGameClientMessage(ws: WebSocket, sessionId: string, message: GameMessage) {
    GameCoordinatorService.updateGameSessionState(sessionId, message);

    const gameState = message.getGameState();
    const { status, canReceiveSabotage, currentSabotageLimit } = gameState;

    // If game is not active, send nothing
    if(status === "setup" || status === "paused") {
      return;
    }

    // If game is over, handle statistics
    if(status === "over") {
      // TODO: Upload statistics to database and close session
    }

    /**
     * If game is active:
     * 1 - Check if client can receive sabotages
     * 2 - If no, return
     * 3 - If yes, send sabotages from queue (if any exists)
     * 4 - Refresh available sabotage pool
     */
    if(status === "active") {
      if(canReceiveSabotage && GameCoordinatorService.getSabotageQueue(sessionId).length > 0){
        GameCoordinatorService.sendSabotages(sessionId);
        
        const availableSabotagePool = GameCoordinatorService.generateSabotages(5);
        GameCoordinatorService.setAvailableSabotages(sessionId, availableSabotagePool);

        const gameSession = GameCoordinatorService.getGameSession(sessionId);
        const gameMessage = new GameMessage(gameSession.getGameState(), gameSession.getSabotages());

        Logger.info(JSON.stringify(gameMessage));

        this.sendSabotagesToClient(ws, gameMessage);
      }
      return;
    }
  }

  public sendSabotagesToClient(ws: WebSocket, gameMessage: GameMessage) {
    ws.send(JSON.stringify(gameMessage.toJSON()));
  }

  public hasSession(sessionId: string) {
    return this.sessions.has(sessionId);
  }

  public getAllSessions() {
    const activeSessions = Object.keys(this.sessions);
    return { sessions: activeSessions }
  }
}

export default new WebSocketService();