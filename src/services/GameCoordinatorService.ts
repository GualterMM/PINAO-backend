import { BusinessLogicError, ErrorCode } from "../lib/Exceptions";
import { GameSession, GameSessionParams } from "../models/GameSession";
import { Sabotage } from "../interfaces/GlobalInterfaces";
import { GameMessage } from "../models/GameMessage";
import { pickRandomElements } from "../lib/utils/Utils";
import sabotages from "../assets/Sabotages.json";
import { Logger } from "../lib/Logger";
import GameWebSocketService from "./GameWebSocketService";

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

  public static getAllGameSessions() {
    return GameWebSocketService.getAllSessions();
  }

  public static generateSabotages(maxSabotages: number): Array<Sabotage> {
    const sabotagePool = sabotages.currentSabotagePool as Array<Sabotage>;

    return pickRandomElements(sabotagePool, maxSabotages);
  }

  public static setAvailableSabotages(sessionId: string, sabotages: Array<Sabotage>) {
    const gameSession = this.getGameSession(sessionId);

    gameSession.setAvailableSabotages(sabotages);
    Logger.debug(`Current sabotages: ${JSON.stringify(sabotages)}`);
  }

  public static getAvailableSabotages(sessionId: string): Array<Sabotage> | null {
    const gameSession = this.getGameSession(sessionId);

    return gameSession.getAvailableSabotages();
  }

  public static pushSabotageToQueue(sessionId: string, sabotage: Sabotage) {
    const gameSession = this.getGameSession(sessionId);

    const payload = gameSession.pushSabotageToQueue(sabotage);

    return payload;
  }

  public static getSabotageQueue(sessionId: string){
    const gameSession = this.getGameSession(sessionId);

    return gameSession.getSabotagesQueue();
  }

  public static sendSabotages(sessionId: string) {
    const gameSession = this.getGameSession(sessionId);
    const sabotages = gameSession.getSabotagesQueue();
    gameSession.setActiveSabotages(sabotages);
    gameSession.resetSabotageQueue();
  }

  public static updateSabotageLimit(sessionId: string){
    const gameSession = this.getGameSession(sessionId);
    
    const gameState = gameSession.getGameState();
    const currentSabotageLimit = gameState.currentSabotageLimit ?? 1;
    const maxSabotageLimit = gameState.maxSabotageLimit ?? 1;

    Logger.info(`Current sabotage limit: ${currentSabotageLimit}`);
    Logger.info(`Maximum sabotage limit: ${maxSabotageLimit}`);
    if(currentSabotageLimit < maxSabotageLimit) {
      gameSession.increaseCurrentSabotageLimit();
    } 
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