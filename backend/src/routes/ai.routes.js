import { Router } from "express";
import {
  handleAIChat,
  handleAIRecommend,
  handleCreditSimulation,
} from "../controllers/ai.controller.js";

import { aiGateMiddleware } from "../middlewares/aiGate.middleware.js";

const router = Router();

router.post("/chat", aiGateMiddleware, handleAIChat);
router.post("/recommend", aiGateMiddleware, handleAIRecommend);
router.post("/credit-simulate", aiGateMiddleware, handleCreditSimulation);

export const aiRoutes = router;
