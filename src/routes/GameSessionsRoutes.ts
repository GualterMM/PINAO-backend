import { Router } from "express";

import { GameSessionController } from "../controllers/GameSessionController";

const router = Router();

router.post('/game-session/:id/message', GameSessionController.SendGameMessage);

export { router as GameSessionsRouter };