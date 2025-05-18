import { Logger } from "../lib/Logger";
import { GameState, Sabotage, Sabotages } from "../interfaces/GlobalInterfaces";
import { BusinessLogicError, ErrorCode } from "../lib/Exceptions";

export interface GameSessionParams {
  gameState: GameState,
  sabotages: Sabotages
}

export class GameSession {
  private gameState: GameState;
  private sabotages: Sabotages;
  public activeSabotageTicker: boolean = false
  public ticker: number = 0;

  constructor(params: GameSessionParams) {
    this.gameState = params.gameState;
    this.sabotages = params.sabotages;
  }

  public tick() {
    this.ticker++;
  }

  public getGameState() {
    return this.gameState;
  }

  public setGameState(gameState: GameState) {
    this.gameState = gameState;
  }

  public getSabotages() {
    return this.sabotages;
  }

  public getAvailableSabotages(): Array<Sabotage> {
    return this.sabotages.availableSabotagePool;
  }

  public setAvailableSabotages(sabotages: Array<Sabotage>) {
    this.sabotages.availableSabotagePool = sabotages;
  }

  public getSabotagesQueue() {
    return this.sabotages.sabotageQueue;
  }

  public pushSabotageToQueue(sabotage: Sabotage) {
    if (!this.isSessionActive()) {
      throw new BusinessLogicError({
        errorMessage: "Player has paused the game",
        errorCode: ErrorCode.GAME_LOGIC_SESSION_NOT_ACTIVE
      });
    }

    if (this.sabotages.sabotageQueue.some(item => item.playerId === sabotage.playerId)) {
      throw new BusinessLogicError({
        errorMessage: "You have already selected a sabotage",
        errorCode: ErrorCode.GAME_LOGIC_INVALID_SABOTAGE
      });
    }

    if (this.sabotages.sabotageQueue.length >= (this.gameState.currentSabotageLimit ?? 1)) {
      throw new BusinessLogicError({
        errorMessage: "Sabotage queue is full",
        errorCode: ErrorCode.GAME_LOGIC_SABOTAGE_QUEUE_FULL
      });
    }

    if (!this.sabotages.availableSabotagePool.some(item => item.id === sabotage.id)) {
      throw new BusinessLogicError({
        errorMessage: "Invalid sabotage",
        errorCode: ErrorCode.GAME_LOGIC_INVALID_SABOTAGE
      });
    }

    if (this.isSessionOver()) {
      throw new BusinessLogicError({
        errorMessage: "Game session has ended",
        errorCode: ErrorCode.GAME_LOGIC_SESSION_ENDED
      })
    }

    const sabotageCard = this.sabotages.availableSabotagePool.find(item => item.id === sabotage.id);
    this.sabotages.sabotageQueue.push({ ...sabotageCard, ...sabotage });

    return this.sabotages.sabotageQueue;
  }

  public resetSabotageQueue() {
    this.sabotages.sabotageQueue = [];

    return this.sabotages.sabotageQueue;
  }

  public getActiveSabotages() {
    return this.sabotages.activeSabotagePool;
  }

  public setActiveSabotages(sabotages: Array<Sabotage>): Array<Sabotage> {
    const validSabotages: Array<Sabotage | undefined> = sabotages.map((item) => {
      if (this.sabotages.availableSabotagePool.some(availableItem => availableItem.id === item.id)) {
        return item
      }
    });

    this.sabotages.activeSabotagePool = validSabotages as Array<Sabotage>;

    return this.sabotages.activeSabotagePool;
  }

  public increaseCurrentSabotageLimit(){
    if((this.gameState.currentSabotageLimit ?? 1) < (this.gameState.maxSabotageLimit ?? 1)) {
      this.gameState.currentSabotageLimit = (this.gameState.currentSabotageLimit ?? 1) + 1;

      Logger.info(`Sabotage limit increased to ${this.gameState.currentSabotageLimit}`);
    }
  }

  public isSessionOver(): boolean {
    if ((this.gameState.currentDuration ?? Date.now()) >= (this.gameState.gameDuration ?? Date.now())) {
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
      sabotageQueue: []
    }

    return { gameState, sabotages };
  }

}