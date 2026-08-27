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

const REDIRECT_TO_RECOMMEND_MESSAGE =
  'For additional car recommendations, please use the AI Recommendation feature on this platform. ' +
  'You can set budget, passenger count, and preferences there for more accurate results. ' +
  'In chat, I can only provide one recommendation list per request.';

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

function extractChatJsonFromLlm(content) {
  let text = String(content ?? '').trim();

  text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  text = text.replace(/^---+\s*FORMAT[^\n]*---+\s*/gim, '').trim();
  text = text.replace(/^--+\s*FORMAT[^\n]*--+\s*/gim, '').trim();

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON object found in LLM response');
    return JSON.parse(match[0]);
  }
}

function looksLikeLeakedAiFormat(rawContent) {
  const text = String(rawContent ?? '');
  return (
    /FORMAT\s+[ACR]/i.test(text) ||
    /"replyType"\s*:/.test(text) ||
    /"items"\s*:\s*\[/.test(text)
  );
}

function isFollowUpRecommendationRequest(message) {
  const m = String(message ?? '').toLowerCase().trim();
  return /rekomendasi\s*(lain|lainnya)|other\s*recommendations?|show\s*more|more\s*options?|opsi\s*lain|pilihan\s*lain|selain\s*(itu|ini|tersebut)/i.test(
    m,
  );
}

function parseChatAiResponse(rawContent, cars) {
  const fallbackText = String(rawContent ?? '').trim();

  try {
    const parsed = extractChatJsonFromLlm(rawContent);

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

  if (looksLikeLeakedAiFormat(fallbackText)) {
    return {
      replyType: 'text',
      reply:
        'Sorry, I could not format the recommendation properly. Please try again or use the AI Recommendation feature.',
      items: null,
    };
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

    // Block follow-up recommendation requests — arahkan ke fitur Recommendation
    if (isFollowUpRecommendationRequest(message)) {
      return res.status(200).json({
        success: true,
        data: {
          replyType: 'text',
          reply: REDIRECT_TO_RECOMMEND_MESSAGE,
          items: null,
          recommendations: null,
          cars: null,
          ...aiMeta(req),
        },
      });
    }

    const activeCars = await getActiveCars();

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
      `- ONE car recommendation list per explicit request\n` +
      `- RAC AI platform features (catalog, wishlist, showroom, premium, credit simulation for cars)\n` +
      `- General car-buying guidance tied to vehicles in the catalog\n\n` +
      `FORBIDDEN: politics, government programs, food/nutrition, history, math, celebrities, weather, sports, homework, or ANY topic not listed above.\n\n` +
      `CLASSIFY each user message:\n` +
      `- RECOMMENDATION: user explicitly asks to recommend/suggest/list multiple cars\n` +
      `- ON-TOPIC: single question about catalog cars or car buying on RAC AI\n` +
      `- OFF-TOPIC: anything else\n` +
      `- FOLLOW-UP RECOMMENDATION: user asks for "more recommendations", "rekomendasi lain", "other options" → plain text redirect only\n\n` +
      `RECOMMENDATION RULES:\n` +
      `- Output ONLY a single raw JSON object. No headings. No "FORMAT C". No markdown fences. No text before or after JSON.\n` +
      `- Schema:\n` +
      `{"replyType":"recommendations","reply":"<1 short intro>","items":[{"carId":"...","slug":"...","aiReason":"..."}]}\n` +
      `- Max 5 items. carId and slug MUST match catalog exactly. Do NOT invent cars.\n` +
      `- If no match: {"replyType":"text","reply":"No vehicles in the RAC AI catalog match your criteria at this time."}\n\n` +
      `ON-TOPIC RULES:\n` +
      `- English only. Plain text only (NOT JSON).\n` +
      `- Use ONLY catalog data. Never invent specs/prices.\n` +
      `- No Markdown tables, |, #, or **bold**.\n\n` +
      `FOLLOW-UP RECOMMENDATION RULES:\n` +
      `- If user asks for more/other recommendations ("rekomendasi lain", "show more", etc.), reply with plain text ONLY:\n` +
      `"${REDIRECT_TO_RECOMMEND_MESSAGE}"\n\n` +
      `OFF-TOPIC RULES:\n` +
      `- English only. Plain text only (NOT JSON).\n` +
      `- Reply with EXACTLY this message and NOTHING else:\n` +
      `"I'm RAC AI, your car recommendation assistant. I can only help with questions about vehicles in our catalog, car recommendations, and car-related topics on this platform. Please ask me about cars or use the recommendation feature."\n\n` +
      `EXAMPLES:\n` +
      `User: "Recommend 3 hatchbacks under 300 million" → JSON recommendations\n` +
      `User: "How much is the Honda Brio?" → plain text\n` +
      `User: "rekomendasi lain" → redirect message (plain text, NOT JSON)\n` +
      `User: "program makanan bergizi gratis" → exact refusal message only\n\n` +
      `FINAL CHECK:\n` +
      `- OFF-TOPIC → refusal only.\n` +
      `- FOLLOW-UP RECOMMENDATION → redirect message only.\n` +
      `- RECOMMENDATION → raw JSON only.\n` +
      `- When in doubt → treat as OFF-TOPIC.`;

    const aiResponse = await invokeGroq(systemText, message, { temperature: 0.1 });

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
        recommendations: chatPayload.items,
        cars: chatPayload.items,
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