import { BusinessLogicError, ErrorCode } from "../lib/Exceptions";

import { GameState, Sabotages, Statistics } from "../interfaces/GlobalInterfaces";
import { GameMessageSchema } from "./validators/GameMessageValidator";


export class GameMessage {
  public type: "gameUpdate" | "sabotageOver";
  private gameState: GameState;
  private sabotages?: Sabotages;
  private statistics?: Statistics;

  constructor(gameState: GameState, sabotages?: Sabotages, statistics?: Statistics, type?: "gameUpdate" | "sabotageOver") {
    this.type = type ?? "gameUpdate";
    this.gameState = gameState;
    this.sabotages = sabotages;
    this.statistics = statistics;
  }

  public getGameState(){
    return this.gameState;
  }

  public getSabotages() {
    return this.sabotages;
  }

  public getStatistics() {
    return this.statistics;
  }

  public toObject(): object {
    return {
      gameState: this.gameState,
      sabotages: this.sabotages,
      statistics: this.statistics
    }
  }

  public toJSON(): object {
    return this.toObject();
  }

  public static fromObject(obj: any): GameMessage {
    const { error, value } = GameMessageSchema.validate(obj);

    if (error) {
      throw new BusinessLogicError({
        errorMessage: `GameMessage validation failed: ${error.message}`
      });
    }

    return new GameMessage(
      value.gameState,
      value.sabotages,
      value.statistics
    );
  }
}