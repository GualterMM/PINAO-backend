import Joi from "joi";

const SabotageSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  effect: Joi.string().required(),
  duration: Joi.number().required(),
});

const GameStateSchema = Joi.object({
  sessionId: Joi.string().required(),
  status: Joi.string().valid("setup", "live", "paused", "over").required(),
  gameDuration: Joi.number().required(),
  currentDuration: Joi.number().required(),
  graceDuration: Joi.number().required(),
});

const SabotagesSchema = Joi.object({
  gameSabotageLimit: Joi.number().required(),
  currentSabotageLimit: Joi.number().required(),
  canReceiveSabotage: Joi.boolean().required(),
  hasCurrentSabotagePoolBeenConsumed: Joi.boolean().required(),
  currentSabotagePool: Joi.array().items(SabotageSchema).required(),
  activeSabotagePool: Joi.array().items(SabotageSchema).required(),
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
  bestKillStreak: Joi.number().required(),
  mostUsedWeapon: Joi.string().required(),
  sabotagesReceived: Joi.number().required(),
  boostsReceived: Joi.number().required(),
  timeBoostsReceived: Joi.number().required(),
  weaponsUpgradesMade: Joi.number().required(),
});

const StatisticsSchema = Joi.object({
  player: PlayerStatisticsSchema.required(),
  saboteurs: Joi.array().items(SaboteurStatisticsSchema).required(),
});

export const GameMessageSchema = Joi.object({
  gameState: GameStateSchema.required(),
  sabotages: SabotagesSchema.optional(),
  statistics: StatisticsSchema.optional(),
});
