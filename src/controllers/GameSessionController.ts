import { Request, Response, NextFunction } from 'express';

import { ServerResponse } from '../lib/ServerResponse';
import { GameCoordinatorService } from '../services/GameCoordinatorService';
import { Sabotage } from '../interfaces/GlobalInterfaces';

export class GameSessionController {
  public static async SendSabotage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: sessionId } = req.params;
      const { sabotage } = req.body;

      const payload = GameCoordinatorService.pushSabotageToQueue(sessionId, sabotage as Sabotage)

      return ServerResponse.Success.Created(req, res, { payload });
    } catch (error) {
      next(error);
    }
  }

  public static async GetSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = GameCoordinatorService.getAllGameSessions();

      return ServerResponse.Success.OK(req, res, { ...payload });
    } catch(error) {
      next(error);
    }
  }
}