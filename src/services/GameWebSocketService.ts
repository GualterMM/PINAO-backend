import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
import { IncomingMessage } from "http";

import { Logger } from "../lib/Logger";

import { GameSession } from "../models/GameSession";
import { GameMessage } from "../models/GameMessage";
import { GameCoordinatorService } from "./GameCoordinatorService";
import ViewerWebSocketService from "./ViewerWebSocketService";

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
        console.log(data.toString());

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
    const { type } = message;
    const { status, canReceiveSabotage } = gameState;

    // If game is not active, send nothing
    if (status === "setup" || status === "paused") {
      return;
    }

    // If game is over, handle statistics
    if (status === "over") {
      // TODO: Upload statistics to database and close session
    }

    // If game is active, actuate sabotages according to client state
    if (status === "active") {
      const gameSession = GameCoordinatorService.getGameSession(sessionId);

      Logger.info(`Can receive sabotage? ${canReceiveSabotage}, Sabotage Queue: ${GameCoordinatorService.getSabotageQueue(sessionId)}`)
      // Send sabotages on queue if any exist and client can receive them
      if (canReceiveSabotage && GameCoordinatorService.getSabotageQueue(sessionId).length > 0) {
        GameCoordinatorService.sendSabotages(sessionId);

        const availableSabotagePool = GameCoordinatorService.generateSabotages(5);
        GameCoordinatorService.setAvailableSabotages(sessionId, availableSabotagePool)
      }

      // Send ticks to reset active sabotage, if they're active
      if (GameCoordinatorService.getActiveSabotages(sessionId).length > 0) {
        GameCoordinatorService.tickGameSession(sessionId)
      }

      console.log(GameCoordinatorService.getGameSession(sessionId).getSabotagesQueue())

      // Send message back to client
      const gameMessage = new GameMessage(gameSession.getGameState(), gameSession.getSabotages());

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