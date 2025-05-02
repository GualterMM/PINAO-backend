import { Request, Response, NextFunction } from 'express';

import { ServerResponse } from '../lib/ServerResponse';
import WebSocketService from '../services/WebSocketService';

export class GameSessionsController {
  public static async SendGameMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: sessionId } = req.params;
      const { message } = req.body;

      const payload = WebSocketService.SendMessageToSession(sessionId, message);

      return ServerResponse.Success.Created(req, res, { message: payload });
    } catch (error) {
      next(error);
    }
  }
}