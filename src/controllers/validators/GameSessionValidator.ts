import Joi from "joi";

export class GameSessionValidator {
  public static SendSabotage = {
    params: Joi.object({
      id: Joi.string().guid({ version: ['uuidv4'] }).required(),
    }),

    body: Joi.object({
      sabotage: Joi.object({
        id: Joi.string().required(),
        name: Joi.string().required(),
        description: Joi.string().required(),
        multiplier: Joi.number().required(),
        duration: Joi.number().required(),
        playerName: Joi.string().required(),
        playerMessage: Joi.string().required(),
      })
    })
  }
}