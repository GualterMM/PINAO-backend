export interface Sabotage {
  id: string,
  name: string,
  baseDuration: number,
  playerName?: string,
  playerMessage?: string
}

export interface Sabotages {
  availableSabotagePool: Array<Sabotage>,
  activeSabotagePool: Array<Sabotage>
}

export interface GameState {
  sessionId: string,
  status: "setup" | "active" | "paused" | "over",
  gameDuration?: number,
  currentDuration?: number,
  graceDuration?: number,

  maxSabotageLimit?: number,
  currentSabotageLimit?: number,
  canReceiveSabotage?: boolean,
  availableSabotagePoolVersion?: number,
}

export interface PlayerStatistics {
  name: string,
  time: number,
  success: boolean,
  points: number,
  kills: number,
  bestKillStreak: number,
  mostUsedWeapon: string,
  sabotagesReceived: number,
  boostsReceived: number,
  timeBoostsReceived: number,
  weaponsUpgradesMade: number,
}

export interface UsedSabotage extends Sabotage {
  amountUsed: number,
  playerHpLostWhileActive: number
}

export interface SaboteurStatistics {
  name: string,
  sabotages: Array<UsedSabotage>
}

export interface Statistics {
  player: PlayerStatistics,
  saboteurs: Array<SaboteurStatistics>
}