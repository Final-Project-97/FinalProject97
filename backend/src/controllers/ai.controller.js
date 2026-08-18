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
      return res.status(400).json({ success: false, message: 'Pesan chat wajib diisi dan harus berupa teks.' });
    }

    const activeCars = await getActiveCars(20);
    const catalogSummary = (activeCars || []).map(formatCarSummaryLine).join('\n');

    const systemText =
      `Kamu adalah asisten virtual RAC AI.\nKatalog:\n${catalogSummary || 'Katalog belum tersedia.'}\n` +
      `Jawab hanya dari katalog. Bahasa Indonesia.`;

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
        message: 'Parameter budgetMin dan budgetMax wajib diisi untuk melakukan rekomendasi.',
      });
    }

    const allCars = await getActiveCars();
    if (!allCars?.length) {
      return res.status(404).json({ success: false, message: 'Katalog mobil kosong. Silakan lakukan seeding data terlebih dahulu.' });
    }

    const catalogDetails = allCars.map(formatCarLine).join('\n');
    const budgetLabel = `Rp ${Number(budgetMin).toLocaleString('id-ID')} - Rp ${Number(budgetMax).toLocaleString('id-ID')}`;

    const systemText =
      `Kamu pakar otomotif RAC AI.\nBudget: ${budgetLabel}\nKebutuhan: ${needType || 'Mobilitas harian'}\n` +
      `Penumpang: ${passengers || 'Bebas'}\nPrioritas: ${priority || 'Kenyamanan'}\nWarna: ${selectedColor || 'Bebas'}\n\n` +
      `Katalog:\n${catalogDetails}\n\nOutput JSON murni array [{ carId, matchScore, aiReason, selectedColor }]`;

    const rawAiResponse = await invokeGroq(
      systemText,
      'Berikan rekomendasi mobil terbaik berdasarkan parameter tersebut.',
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
        message: 'Parameter carPrice, downPayment, dan tenorMonths wajib diisi.',
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
      `Penasihat keuangan otomotif. Cicilan: Rp ${calculationResult.monthlyInstallment.toLocaleString('id-ID')}/bulan.\n` +
      `Output JSON: { financialHealthStatus, insightText }`;

    const aiResponse = await invokeGroq(systemText, 'Berikan insight finansial.', { temperature: 0.3 });

    let parsedInsight = { financialHealthStatus: 'Aman', insightText: aiResponse.content };
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