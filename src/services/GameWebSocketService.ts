import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
import { IncomingMessage } from "http";

import { Logger } from "../lib/Logger";

import { GameSession } from "../models/GameSession";
import { GameMessage } from "../models/GameMessage";
import { GameCoordinatorService } from "./GameCoordinatorService";
import ViewerWebSocketService from "./ViewerWebSocketService";
import { savePlayerStats } from "../lib/Database";

class GameWebSocketService {
  private wss: WebSocketServer;
  private sessions = new Map<string, WebSocket>();
  private MAX_SESSIONS = 4;

  constructor() {
    this.wss = new WebSocketServer({ noServer: true });
    this.wss.on('connection', this.handleConnection.bind(this));
  }

  public handleUpgrade(req: IncomingMessage, socket: any, head: Buffer) {
    if (req.url === "/ws/game") {
      this.wss.handleUpgrade(req, socket, head, (ws) => {
        this.wss.emit("connection", ws, req);
      });
    }
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
        
        this.handleGameClientMessage(ws, sessionId, gameMessage);
        ViewerWebSocketService.broadcastToViewers(sessionId, gameMessage);
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
    const gameMessage = new GameMessage(
      {
        sessionId,
        status: "setup"
      },
      {
        activeSabotagePool: [],
        availableSabotagePool,
        sabotageQueue: []
      });
    ws.send(JSON.stringify(gameMessage.toJSON()));
    Logger.info(`Session ${sessionId} established`);
  }

  private handleGameClientMessage(ws: WebSocket, sessionId: string, message: GameMessage) {
    GameCoordinatorService.updateGameSessionState(sessionId, message);

    const gameState = message.getGameState();
    const sabotages = message.getSabotages();
    const statistics = message.getStatistics()?.player
    const { status, canReceiveSabotage } = gameState;

    // If game is not active, send nothing
    if (status === "setup" || status === "paused") {
      return;
    }

    // If game is over, handle statistics
    if (status === "over" && statistics) {
      Logger.info(`Saving game statistics from ${sessionId}`)
      ws.close()

      const { name, time, success, points, kills } = statistics

      const playerName = name || "Anonymous";
      const finalScore = points || 0;
      const intSucess = success ? 1 : 0
      
      try {
        savePlayerStats(sessionId, playerName, finalScore, kills, intSucess, time)
        Logger.info(`Game statistics from ${sessionId} saved successfully`)
      } catch (err){
        Logger.info(`Error saving games statistics from ${sessionId}: ${err}`)
      }

      return 
    }

    // If game is active, actuate sabotages according to client state
    if (status === "active") {
      let hasServerSetActiveSabotages = false

      // Send sabotages on queue if any exist and client can receive them
      if (canReceiveSabotage && GameCoordinatorService.getSabotageQueue(sessionId).length > 0) {
        GameCoordinatorService.sendSabotages(sessionId);
        hasServerSetActiveSabotages = true

        const availableSabotagePool = GameCoordinatorService.generateSabotages(5);
        GameCoordinatorService.setAvailableSabotages(sessionId, availableSabotagePool)
      }

      // Send ticks to reset active sabotage, if they're active
      if (!hasServerSetActiveSabotages) {
        GameCoordinatorService.setActiveSabotages(sessionId, sabotages?.activeSabotagePool ?? [])
      }

      const updatedGameSession = GameCoordinatorService.getGameSession(sessionId)
      
      // Send message back to client
      const gameMessage = new GameMessage(updatedGameSession.getGameState(), updatedGameSession.getSabotages());

      this.sendMessageToClient(ws, gameMessage);

      return;
    }
  }

  public sendMessageToClient(ws: WebSocket, gameMessage: GameMessage) {
    ws.send(JSON.stringify(gameMessage.toJSON()));
  }

  public hasSession(sessionId: string) {
    return this.sessions.has(sessionId);
  }

  public getAllSessions() {
    const activeSessions = Array.from(this.sessions.keys());
    return { sessions: activeSessions }
  }
}

export default new GameWebSocketService();