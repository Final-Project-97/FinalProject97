import { Router } from "express";
import {
  handleAIChat,
  handleAIRecommend,
  handleCreditSimulation,
} from "../controllers/ai.controller.js";

import { aiGateMiddleware } from "../middlewares/aiGate.middleware.js";
import { requireAuth } from "../auth/middleware.js";

const router = Router();

router.post("/chat", requireAuth,aiGateMiddleware, handleAIChat);
router.post("/recommend", requireAuth, aiGateMiddleware, handleAIRecommend);
router.post("/credit-simulate", requireAuth, aiGateMiddleware, handleCreditSimulation);

export const aiRoutes = router;
