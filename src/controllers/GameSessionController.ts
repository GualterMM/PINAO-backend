import { Request, Response, NextFunction } from 'express';

import { ServerResponse } from '../lib/ServerResponse';
import { GameCoordinatorService } from '../services/GameCoordinatorService';
import { Sabotage } from '../interfaces/GlobalInterfaces';
import { getAllPlayers, getAllSuccessfulPlayers } from '../lib/Database';

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

  public static async GetSuccessfulPlayers(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = getAllSuccessfulPlayers();

      return ServerResponse.Success.OK(req, res, { ...payload });
    } catch(error) {
      next(error);
    }
  }

  public static async GetAllPlayers(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = getAllPlayers();

      return ServerResponse.Success.OK(req, res, { ...payload });
    } catch(error) {
      next(error);
    }
  }
}