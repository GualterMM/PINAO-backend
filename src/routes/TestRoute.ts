import { Router } from "express";
import { TestController } from "../controllers/TestController";

export const TestRoutes = Router();
const testController = new TestController();

TestRoutes.get('/ping', testController.GetPing);
