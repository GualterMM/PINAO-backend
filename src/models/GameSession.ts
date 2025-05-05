import { GameState, Sabotage, Sabotages } from "../interfaces/GlobalInterfaces";
import { BusinessLogicError, ErrorCode } from "../lib/Exceptions";

export interface GameSessionParams {
  gameState: GameState,
  sabotages: Sabotages
}

export class GameSession {
  private gameState: GameState;
  private sabotages: Sabotages;
  private sabotagesQueue: Array<Sabotage>;

  constructor(params: GameSessionParams) {
    this.gameState = params.gameState;
    this.sabotages = params.sabotages;
    this.sabotagesQueue = [];
  }

  public getGameState() {
    return this.gameState;
  }

  public setGameState(gameState: GameState) {
    this.gameState = gameState;
  }

  public getSabotages(){
    return this.sabotages;
  }

  public getAvailableSabotagesVersion() {
    return this.gameState.availableSabotagePoolVersion;
  }

  public setAvailableSabotagesVersion(version: number) {
    this.gameState.availableSabotagePoolVersion = version;
  }

  public getAvailableSabotages(): Array<Sabotage> {
    return this.sabotages.availableSabotagePool;
  }

  public setAvailableSabotages(sabotages: Array<Sabotage>) {
    this.sabotages.availableSabotagePool = sabotages;
  }

  public getSabotagesQueue() {
    return this.sabotagesQueue;
  }

  public pushSabotageToQueue(sabotage: Sabotage) {

    if (this.sabotagesQueue.length >= (this.gameState.currentSabotageLimit ?? 1)) {
      throw new BusinessLogicError({
        errorMessage: "Sabotage queue is full",
        errorCode: ErrorCode.GAME_LOGIC_SABOTAGE_QUEUE_FULL
      });
    }

    if (!this.sabotages.availableSabotagePool.includes(sabotage)) {
      throw new BusinessLogicError({
        errorMessage: "Invalid sabotage",
        errorCode: ErrorCode.GAME_LOGIC_INVALID_SABOTAGE
      });
    }

    if (!this.isGracePeriodOver()) {
      throw new BusinessLogicError({
        errorMessage: "Player is in grace period",
        errorCode: ErrorCode.GAME_LOGIC_PLAYER_IN_GRACE_PERIOD
      });
    }

    if (this.isSessionOver()) {
      throw new BusinessLogicError({
        errorMessage: "Game session has ended",
        errorCode: ErrorCode.GAME_LOGIC_SESSION_ENDED
      })
    }

    this.sabotagesQueue.push(sabotage);

    return this.sabotagesQueue;
  }

  public resetSabotageQueue() {
    this.sabotagesQueue = [];

    return this.sabotagesQueue;
  }

  public getCurrentSabotages() {
    return this.sabotages.activeSabotagePool;
  }

  public setCurrentSabotages(sabotages: Array<Sabotage>): Array<Sabotage> {
    const validSabotages: Array<Sabotage | undefined> = sabotages.map((item) => {
      if (this.sabotages.availableSabotagePool.includes(item)) {
        return item
      }
    });

    if (validSabotages.length === 0) {
      return [];
    }

    this.sabotages.activeSabotagePool = validSabotages as Array<Sabotage>;

    return this.sabotages.activeSabotagePool;
  }

  private isGracePeriodOver(): boolean {
    if ((this.gameState.currentDuration ?? -1) < (this.gameState.graceDuration ?? 0)) {
      return false;
    }

    return true;
  }

  public isSessionOver(): boolean {
    if (Date.now() >= (this.gameState.gameDuration ?? Date.now())) {
      return true;
    }

    return false;
  }

  public isSessionActive(): boolean {
    return this.gameState.status === "active";
  }

  public static getDefaultParams() {
    const gameState: GameState = {
      sessionId: "",
      status: "setup"
    };

    const sabotages: Sabotages = {
      availableSabotagePool: [],
      activeSabotagePool: [],
    }

    return { gameState, sabotages };
  }

}