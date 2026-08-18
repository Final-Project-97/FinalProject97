import Car from '../models/car.model.js';
import { calculateCreditSimulation } from '../helpers/credit.helper.js';
import { invokeGroq } from '../ai/groq.service.js';
import { mapGroqError } from '../ai/errors.js';
import { logAiUsage } from '../ai/usageLog.service.js';
import {
  getActiveCars,
  formatCarLine,
  formatCarSummaryLine,
  parseJsonFromLlm,
} from '../ai/catalog.helper.js';

function aiMeta(req) {
  return {
    accessType: req.aiAccessType,
    remainingTokens: req.remainingTokens !== undefined ? req.remainingTokens : 'unlimited',
  };
}

export async function handleAIChat(req, res) {
  try {
    const { message } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Chat message is required and must be a string.',
      });
    }

    const activeCars = await getActiveCars(20);
    const catalogSummary = (activeCars || []).map(formatCarSummaryLine).join('\n');

    const systemText =
      `You are RAC AI, a virtual assistant for car buyers in Indonesia.\n` +
      `Catalog (use ONLY these vehicles):\n${catalogSummary || 'Catalog unavailable.'}\n\n` +
      `Rules:\n` +
      `- Reply in English only.\n` +
      `- Use only vehicles from the catalog above.\n` +
      `- Format: simple numbered list (1., 2., 3.).\n` +
      `- Each item: car name, price (IDR), type, seats, transmission.\n` +
      `- Do NOT use Markdown tables, pipe symbols (|), headings (#), or **bold**.\n` +
      `- Keep answers short and mobile-friendly (max 5 cars unless the user asks for more).`;

    const aiResponse = await invokeGroq(systemText, message, { temperature: 0.3 });

    await logAiUsage({ userId, feature: 'chat', metadata: { promptLength: message.length } });

    return res.status(200).json({
      success: true,
      data: { reply: aiResponse.content, ...aiMeta(req) },
    });
  } catch (error) {
    console.error('[AI Chat Controller]', error);
    const mapped = mapGroqError(error);
    return res.status(mapped.httpStatus).json(mapped.body);
  }
}

export async function handleAIRecommend(req, res) {
  try {
    const { budgetMin, budgetMax, needType, passengers, priority, selectedColor } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!budgetMin || !budgetMax) {
      return res.status(400).json({
        success: false,
        message: 'budgetMin and budgetMax are required for recommendations.',
      });
    }

    const allCars = await getActiveCars();
    if (!allCars?.length) {
      return res.status(404).json({
        success: false,
        message: 'Car catalog is empty. Please run data seeding first.',
      });
    }

    const catalogDetails = allCars.map(formatCarLine).join('\n');
    const budgetLabel = `IDR ${Number(budgetMin).toLocaleString('en-US')} - IDR ${Number(budgetMax).toLocaleString('en-US')}`;

    const systemText =
      `You are RAC AI automotive expert for buyers in Indonesia.\n` +
      `Budget: ${budgetLabel}\n` +
      `Need: ${needType || 'Daily mobility'}\n` +
      `Passengers: ${passengers || 'Any'}\n` +
      `Priority: ${priority || 'Comfort'}\n` +
      `Preferred color: ${selectedColor || 'Any'}\n\n` +
      `Catalog:\n${catalogDetails}\n\n` +
      `Output a pure JSON array only (no markdown, no prose):\n` +
      `[{ "carId": "<id from catalog>", "matchScore": 0-100, "aiReason": "<short reason in English>", "selectedColor": "<color or Any>" }]\n` +
      `Return up to 5 best matches. aiReason must be in English.`;

    const rawAiResponse = await invokeGroq(
      systemText,
      'Recommend the best cars based on the criteria above.',
      { temperature: 0.2 },
    );

    let parsedRecommendations = [];
    try {
      parsedRecommendations = parseJsonFromLlm(rawAiResponse.content);
    } catch {
      parsedRecommendations = [{ rawInsight: rawAiResponse.content }];
    }

    await logAiUsage({
      userId,
      feature: 'recommend',
      metadata: { criteria: { budgetMin, budgetMax, needType, passengers, priority, selectedColor } },
    });

    return res.status(200).json({
      success: true,
      data: { recommendations: parsedRecommendations, ...aiMeta(req) },
    });
  } catch (error) {
    console.error('[AI Recommend Controller]', error);
    const mapped = mapGroqError(error);
    return res.status(mapped.httpStatus).json(mapped.body);
  }
}

export async function handleCreditSimulation(req, res) {
  try {
    const { carPrice, downPayment, tenorMonths, interestRatePerYear } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!carPrice || !downPayment || !tenorMonths) {
      return res.status(400).json({
        success: false,
        message: 'carPrice, downPayment, and tenorMonths are required.',
      });
    }

    const rate = interestRatePerYear ? Number(interestRatePerYear) : 7.5;
    let calculationResult;
    try {
      calculationResult = calculateCreditSimulation(
        Number(carPrice),
        Number(downPayment),
        Number(tenorMonths),
        rate,
      );
    } catch (mathError) {
      return res.status(400).json({ success: false, message: mathError.message });
    }

    const systemText =
      `You are an automotive finance advisor.\n` +
      `Monthly installment: IDR ${calculationResult.monthlyInstallment.toLocaleString('en-US')}.\n` +
      `Reply in English only.\n` +
      `Output pure JSON only: { "financialHealthStatus": "Safe|Moderate|Risky", "insightText": "<2-3 sentences in English>" }`;

    const aiResponse = await invokeGroq(
      systemText,
      'Provide a brief financial insight for this loan simulation.',
      { temperature: 0.3 },
    );

    let parsedInsight = { financialHealthStatus: 'Safe', insightText: aiResponse.content };
    try {
      parsedInsight = parseJsonFromLlm(aiResponse.content);
    } catch { /* fallback */ }

    await logAiUsage({
      userId,
      feature: 'credit',
      metadata: { carPrice, tenorMonths, monthlyInstallment: calculationResult.monthlyInstallment },
    });

    return res.status(200).json({
      success: true,
      data: { calculation: calculationResult, aiFinancialInsight: parsedInsight, ...aiMeta(req) },
    });
  } catch (error) {
    console.error('[Credit Simulation Controller]', error);
    const mapped = mapGroqError(error);
    return res.status(mapped.httpStatus).json(mapped.body);
  }
}