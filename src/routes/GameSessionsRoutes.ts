import { Router } from "express";

import { GameSessionsController } from "../controllers/GameSessionsController";

const router = Router();

router.post('/game-session/:id/message', GameSessionsController.SendGameMessage);

export { router as GameSessionsRouter };