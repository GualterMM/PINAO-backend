import { BusinessLogicError, ErrorCode } from "../lib/Exceptions";
import { GameSession, GameSessionParams } from "../models/GameSession";
import { Sabotage } from "../interfaces/GlobalInterfaces";
import { GameMessage } from "../models/GameMessage";

export class GameCoordinatorService {
  private static sessions = new Map<string, GameSession>();

  public static registerGameSession(sessionId: string, params: GameSessionParams) {
    if(!GameCoordinatorService.sessions.get(sessionId)){
      const gameSession = new GameSession(params);
      GameCoordinatorService.sessions.set(sessionId, gameSession);
    }
  }

  public static revokeGameSession(sessionId: string) {
    this.sessions.delete(sessionId);
  }

  public static getGameSession(sessionId: string): GameSession {
    const gameSession = this.sessions.get(sessionId);

    if (!gameSession) {
      throw new BusinessLogicError({
        errorMessage: "Game session does not exist",
        errorCode: ErrorCode.GAME_LOGIC_SESSION_NOT_FOUND
      })
    }

    return gameSession;
  }

  public static updateGameSessionState(sessionId: string, message: GameMessage) {
    const gameSession = this.getGameSession(sessionId);
    const gameState = message.getGameState();

    gameSession.setGameState(gameState);
  }

  public static setAvailableSabotages(sessionId: string, sabotages: Array<Sabotage>, version: number) {
    const gameSession = this.getGameSession(sessionId);

    gameSession.setAvailableSabotages(sabotages);
    gameSession.setAvailableSabotagesVersion(version);
  }

  public static getAvailableSabotages(sessionId: string): Array<Sabotage> | null {
    const gameSession = this.getGameSession(sessionId);

    return gameSession.getAvailableSabotages();
  }

  public static getAvailableSabotagesVersion(sessionId: string) {
    const gameSession = this.getGameSession(sessionId);

    return gameSession.getAvailableSabotagesVersion();
  }

  public static pushSabotageToQueue(sessionId: string, sabotage: Sabotage) {
    const gameSession = this.getGameSession(sessionId);

    const payload = gameSession.pushSabotageToQueue(sabotage);

    return payload;
  }

  public static sendSabotages(sessionId: string) {
    const gameSession = this.getGameSession(sessionId);
    const sabotages = gameSession.getSabotagesQueue();
    gameSession.setCurrentSabotages(sabotages);
    gameSession.resetSabotageQueue();
  }

  public static isSessionOver(sessionId: string): boolean {
    const gameSession = this.getGameSession(sessionId);

    return gameSession.isSessionOver();
  }

  public static isSessionActive(sessionId: string): boolean {
    const gameSession = this.getGameSession(sessionId);

    return gameSession.isSessionActive();
  }
}