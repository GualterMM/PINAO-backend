import Joi from "joi";

export class GameSessionValidator {
  public static SendSabotage = {
    params: Joi.object({
      id: Joi.string().guid({ version: ['uuidv4'] }).required(),
    }),

    body: Joi.object({
      sabotage: Joi.object({
        id: Joi.string().required(),
      })
    })
  }
}