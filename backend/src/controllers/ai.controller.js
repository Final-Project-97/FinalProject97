import Car from '../models/car.model.js';
import { calculateCreditSimulation } from '../helpers/credit.helper.js';
import { invokeGroq } from '../ai/groq.service.js';
import { mapGroqError } from '../ai/errors.js';
import { logAiUsage } from '../ai/usageLog.service.js';
import {
  getActiveCars,
  formatCarLine,
  formatCarSummaryLine,
  formatCarChatCatalogLine,
  parseJsonFromLlm,
} from '../ai/catalog.helper.js';

function aiMeta(req) {
  return {
    accessType: req.aiAccessType,
    remainingTokens: req.remainingTokens !== undefined ? req.remainingTokens : 'unlimited',
  };
}

function buildCarLookup(cars) {
  const byId = new Map();
  const bySlug = new Map();
  for (const car of cars) {
    byId.set(String(car._id), car);
    bySlug.set(car.slug, car);
  }
  return { byId, bySlug };
}

function validateChatRecommendationItems(rawItems, cars) {
  if (!Array.isArray(rawItems)) return [];

  const { byId, bySlug } = buildCarLookup(cars);

  return rawItems
    .filter((item) => {
      const id = String(item?.carId ?? '');
      const slug = String(item?.slug ?? '');
      return byId.has(id) && bySlug.has(slug) && byId.get(id).slug === slug;
    })
    .slice(0, 5)
    .map((item) => {
      const car = byId.get(String(item.carId));
      return {
        carId: String(car._id),
        slug: car.slug,
        name: car.name,
        brand: car.brand,
        basePrice: Number(car.basePrice) || 0,
        type: car.type,
        thumbnailUrl: car.thumbnailUrl || '',
        aiReason: String(item.aiReason || '').trim(),
      };
    });
}

function parseChatAiResponse(rawContent, cars) {
  const fallbackText = String(rawContent ?? '').trim();

  try {
    const parsed = parseJsonFromLlm(rawContent);

    if (parsed?.replyType === 'recommendations') {
      const items = validateChatRecommendationItems(parsed.items, cars);

      if (items.length > 0) {
        return {
          replyType: 'recommendations',
          reply: String(parsed.reply || 'Here are some cars from the RAC AI catalog:').trim(),
          items,
        };
      }

      return {
        replyType: 'text',
        reply:
          String(parsed.reply || '').trim() ||
          'No vehicles in the RAC AI catalog match your criteria at this time.',
        items: null,
      };
    }

    if (typeof parsed?.reply === 'string') {
      return {
        replyType: 'text',
        reply: parsed.reply.trim(),
        items: null,
      };
    }
  } catch {
    // bukan JSON → plain text
  }

  return {
    replyType: 'text',
    reply: fallbackText,
    items: null,
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

    const catalogSummary = (activeCars || [])
      .map(
        (car) =>
          formatCarChatCatalogLine?.(car) ??
          `- ID: ${car._id}, Slug: ${car.slug}, Name: ${car.name}, Brand: ${car.brand}, ` +
          `Type: ${car.type}, Price: Rp ${(Number(car.basePrice) || 0).toLocaleString('id-ID')}, ` +
          `Seats: ${car.specs?.seats || 5}, Transmission: ${car.specs?.transmission || 'N/A'}`,
      )
      .join('\n');

    const systemText =
      `You are RAC AI, a virtual assistant ONLY for the "RAC AI (Recommendation Auto Car)" platform.\n\n` +
      `CATALOG (single source of truth):\n` +
      `${catalogSummary || 'Catalog unavailable.'}\n\n` +
      `ALLOWED TOPICS (you may answer ONLY these):\n` +
      `- Cars in the catalog above (price, specs, availability, comparison)\n` +
      `- Car recommendations from the catalog\n` +
      `- RAC AI platform features (catalog, wishlist, showroom, premium, credit simulation for cars)\n` +
      `- General car-buying guidance tied to vehicles in the catalog\n\n` +
      `FORBIDDEN: politics, government programs, food/nutrition, history, math, celebrities, weather, sports, homework, or ANY topic not listed above.\n\n` +
      `CLASSIFY each user message:\n` +
      `- RECOMMENDATION: suggest/list/compare multiple cars from catalog\n` +
      `- ON-TOPIC: single question about catalog cars or car buying on RAC AI\n` +
      `- OFF-TOPIC: anything else\n\n` +
      `Use exactly ONE format:\n\n` +
      `--- FORMAT C (RECOMMENDATION) ---\n` +
      `- Output ONLY valid JSON:\n` +
      `{\n` +
      `  "replyType": "recommendations",\n` +
      `  "reply": "<1 short intro>",\n` +
      `  "items": [{ "carId": "...", "slug": "...", "name": "...", "brand": "...", "basePrice": 0, "type": "...", "aiReason": "..." }]\n` +
      `}\n` +
      `- Max 5 items. carId and slug MUST match catalog exactly.\n` +
      `- If no match: { "replyType": "text", "reply": "No vehicles in the RAC AI catalog match your criteria at this time." }\n\n` +
      `--- FORMAT A (ON-TOPIC, plain text) ---\n` +
      `- English only. Plain text only (NOT JSON).\n` +
      `- Use ONLY catalog data. Never invent specs/prices.\n` +
      `- No Markdown tables, |, #, or **bold**.\n\n` +
      `--- FORMAT R (OFF-TOPIC — REFUSAL ONLY) ---\n` +
      `- English only. Plain text only (NOT JSON).\n` +
      `- You MUST reply with EXACTLY this message and NOTHING else (no extra words, no explanation, no answer to their question):\n` +
      `"I'm RAC AI, your car recommendation assistant. I can only help with questions about vehicles in our catalog, car recommendations, and car-related topics on this platform. Please ask me about cars or use the recommendation feature."\n` +
      `- NEVER provide facts, definitions, or advice for OFF-TOPIC questions.\n` +
      `- NEVER use the old prefix "I was built as a smart virtual assistant... The answer to your question is:"\n\n` +
      `EXAMPLES:\n\n` +
      `User: "Recommend 3 hatchbacks under 300 million"\n` +
      `→ FORMAT C JSON\n\n` +
      `User: "How much is the Honda Brio?"\n` +
      `→ FORMAT A\n\n` +
      `User: "program makanan bergizi gratis"\n` +
      `→ FORMAT R (exact refusal message only)\n\n` +
      `User: "Who is the 7th president of Indonesia?"\n` +
      `→ FORMAT R (exact refusal message only)\n\n` +
      `User: "What is 5 + 5?"\n` +
      `→ FORMAT R (exact refusal message only)\n\n` +
      `FINAL CHECK:\n` +
      `- OFF-TOPIC → FORMAT R only. Do NOT answer the question.\n` +
      `- When in doubt → treat as OFF-TOPIC and use FORMAT R.`;

    const aiResponse = await invokeGroq(systemText, message, { temperature: 0.5 });

    const chatPayload = parseChatAiResponse(aiResponse.content, activeCars);

    await logAiUsage({
      userId,
      feature: 'chat',
      metadata: {
        promptLength: message.length,
        replyType: chatPayload.replyType,
        itemCount: chatPayload.items?.length ?? 0,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        replyType: chatPayload.replyType,
        reply: chatPayload.reply,
        items: chatPayload.items,
        ...aiMeta(req),
      },
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