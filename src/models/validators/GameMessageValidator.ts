import Joi from "joi";

const SabotageSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string(),
  description: Joi.string(),
  multiplier: Joi.number(),
  duration: Joi.number(),
  playerId: Joi.string(),
  playerName: Joi.string(),
  playerMessage: Joi.string()
});

const GameStateSchema = Joi.object({
  sessionId: Joi.string(),
  playerName: Joi.string(),
  status: Joi.string().valid("setup", "active", "paused", "over").required(),
  gameDuration: Joi.number(),
  currentDuration: Joi.number(),
  graceDuration: Joi.number(),

  maxSabotageLimit: Joi.number(),
  currentSabotageLimit: Joi.number(),
  canReceiveSabotage: Joi.boolean(),
});

const SabotagesSchema = Joi.object({
  availableSabotagePool: Joi.array().items(SabotageSchema).required(),
  activeSabotagePool: Joi.array().items(SabotageSchema).required(),
  sabotageQueue: Joi.array().items(SabotageSchema).required(),
});

const UsedSabotageSchema = SabotageSchema.keys({
  amountUsed: Joi.number().required(),
  playerHpLostWhileActive: Joi.number().required(),
});

const SaboteurStatisticsSchema = Joi.object({
  name: Joi.string().required(),
  sabotages: Joi.array().items(UsedSabotageSchema).required(),
});

const PlayerStatisticsSchema = Joi.object({
  name: Joi.string().required(),
  time: Joi.number().required(),
  success: Joi.boolean().required(),
  points: Joi.number().required(),
  kills: Joi.number().required(),
  bestKillStreak: Joi.number(),
  mostUsedWeapon: Joi.string(),
  sabotagesReceived: Joi.number(),
  boostsReceived: Joi.number(),
  timeBoostsReceived: Joi.number(),
  weaponsUpgradesMade: Joi.number(),
});

const StatisticsSchema = Joi.object({
  player: PlayerStatisticsSchema.required(),
  saboteurs: Joi.array().items(SaboteurStatisticsSchema),
});

export const GameMessageSchema = Joi.object({
  gameState: GameStateSchema.required(),
  sabotages: SabotagesSchema.optional(),
  statistics: StatisticsSchema.optional(),
});
