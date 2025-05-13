import { Router } from "express";

import { GameSessionController } from "../controllers/GameSessionController";

const router = Router();

router.post('/game-sessions/:id/message', GameSessionController.SendSabotage);
router.get('/game-sessions', GameSessionController.GetSessions);

export { router as GameSessionsRouter };