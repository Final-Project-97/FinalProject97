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
      `You are RAC AI, a virtual assistant for the "RAC AI (Recommendation Auto Car)" platform.\n\n` +
      `CATALOG (single source of truth for car-related questions):\n` +
      `${catalogSummary || 'Catalog unavailable.'}\n\n` +
      `MANDATORY STEPS (internal — do not show these steps to the user):\n` +
      `1. Classify the user question into ONE of:\n` +
      `   - RECOMMENDATION: user asks to recommend, suggest, compare, or list multiple cars.\n` +
      `   - ON-TOPIC: single car question, price, specs, availability (not a multi-car list).\n` +
      `   - OFF-TOPIC: not related to cars or RAC AI catalog.\n\n` +
      `2. Reply using exactly ONE format below:\n\n` +
      `--- FORMAT C (RECOMMENDATION / LIST) ---\n` +
      `- Language: English only.\n` +
      `- Output ONLY valid JSON (no markdown, no extra text):\n` +
      `{\n` +
      `  "replyType": "recommendations",\n` +
      `  "reply": "<1 short intro sentence>",\n` +
      `  "items": [\n` +
      `    {\n` +
      `      "carId": "<exact ID from catalog>",\n` +
      `      "slug": "<exact slug from catalog>",\n` +
      `      "name": "<car name>",\n` +
      `      "brand": "<brand>",\n` +
      `      "basePrice": <number>,\n` +
      `      "type": "<type>",\n` +
      `      "aiReason": "<1 short reason in English>"\n` +
      `    }\n` +
      `  ]\n` +
      `}\n` +
      `- Use ONLY cars from the catalog (max 5 items).\n` +
      `- carId and slug MUST match the catalog exactly.\n` +
      `- If no car fits:\n` +
      `{ "replyType": "text", "reply": "No vehicles in the RAC AI catalog match your criteria at this time." }\n\n` +
      `--- FORMAT A (ON-TOPIC, plain text) ---\n` +
      `- Language: English only.\n` +
      `- Plain text only (NOT JSON).\n` +
      `- Use ONLY vehicles from the catalog.\n` +
      `- Never invent prices or specs.\n` +
      `- If a car is not in the catalog: "That vehicle is not available in the RAC AI catalog at this time."\n` +
      `- Numbered list when listing cars: name, price (IDR), type, seats, transmission.\n` +
      `- No Markdown tables, |, #, or **bold**.\n\n` +
      `--- FORMAT B (OFF-TOPIC, plain text) ---\n` +
      `- Language: English only.\n` +
      `- Plain text only (NOT JSON).\n` +
      `- MUST start with this exact sentence:\n` +
      `"I was built as a smart virtual assistant for the RAC AI (Recommendation Auto Car) platform, but that does not mean I cannot answer your question. The answer to your question is: "\n` +
      `- Then give a short correct answer.\n\n` +
      `EXAMPLES:\n\n` +
      `User: "Recommend 3 hatchbacks under 300 million"\n` +
      `Assistant: FORMAT C JSON with up to 3 items from catalog.\n\n` +
      `User: "How much is the Honda Brio?"\n` +
      `Assistant (FORMAT A): "Honda Brio RS CVT is Rp ..., Hatchback, 5 seats, CVT."\n\n` +
      `User: "Who is the 7th president of Indonesia?"\n` +
      `Assistant (FORMAT B): prefix + "The 7th President of Indonesia is Joko Widodo."\n\n` +
      `FINAL CHECK:\n` +
      `- RECOMMENDATION → FORMAT C JSON only.\n` +
      `- ON-TOPIC / OFF-TOPIC → plain text only, never JSON.\n` +
      `- If unsure between RECOMMENDATION and ON-TOPIC, use FORMAT C when user wants multiple cars.`;

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