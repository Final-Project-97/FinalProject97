import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import Car from "../models/car.model.js";
import { getDB } from "../database.js";
import { ObjectId } from "mongodb";
import { calculateCreditSimulation } from "../helpers/credit.helper.js"

export const handleAIChat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Pesan chat wajib diisi dan harus berupa teks.",
      });
    }

    // Ambil katalog mobil aktif di database via Mongoloquent
    const activeCars = await Car.where("status", "active").limit(20).get();

    const catalogSummary = (activeCars || [])
      .map(
        (car) =>
          `- ${car.name} (${car.brand}), Tipe: ${car.type}, Harga: Rp ${(Number(car.basePrice) || 0).toLocaleString("id-ID")}, Spesifikasi: Mesin ${car.specs?.engine || "N/A"}, Transmisi ${car.specs?.transmission || "N/A"}, Kapasitas ${car.specs?.seats || 5} kursi.`,
      )
      .join("\n");

    const chatModel = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "openai/gpt-oss-120b",
      temperature: 0.3,
    });

    // Prompt RAG dengan instruksi khusus
    const systemInstruction = new SystemMessage(
      `Kamu adalah asisten virtual cerdas untuk platform "RAC AI (Recommendation Auto Car)".\n` +
      `Tugasmu adalah menjawab pertanyaan pengguna secara ramah, profesional, dan akurat berdasarkan HANYA pada data katalog mobil berikut:\n\n` +
      `${catalogSummary || "Katalog belum tersedia."}\n\n` +
      `Aturan Ketat:\n` +
      `1. Jangan pernah merekayasa atau menebak harga dan spesifikasi di luar daftar data di atas.\n` +
      `2. Jika mobil yang ditanyakan tidak ada dalam daftar, katakan dengan sopan bahwa mobil tersebut tidak tersedia dalam katalog.\n` +
      `3. Berikan jawaban dalam bahasa Indonesia yang natural dan lugas.\n` +
      `4. Jika pertanyaan bukan terkait mobil atau bukan terkait RAC AI (Recommendation Auto Car) maka posisikan kamu sebagai asisten virtual paling cerdas dan berpengetahuan luas. Sebagai contoh jika pertanyaan "5 + 5 berapa ?" atau "siapa presiden ke 5 ?" maka pesan awal harus: "Saya diciptakan sebagai asisten virtual cerdas untuk platform RAC AI (Recommendation Auto Car), tapi bukan berarti saya tidak bisa menjawab pertanyaan kamu. Jawaban dari pertanyaan kamu adalah: "`,
    );

    const userQuery = new HumanMessage(message);

    const aiResponse = await chatModel.invoke([systemInstruction, userQuery]);

    // Catat log penggunaan AI secara aman
    try {
      const db = getDB();
      if (db) {
        const validUserId =
          userId && ObjectId.isValid(userId)
            ? new ObjectId(userId)
            : String(userId || "anonymous");
        await db.collection("ai_usage_logs").insertOne({
          userId: validUserId,
          feature: "chat",
          tokensUsed: 1,
          metadata: {
            promptLength: message.length,
            responseLength: String(aiResponse.content).length,
          },
          createdAt: new Date(),
        });
      }
    } catch (logErr) {
      console.warn(
        "[AI Controller] Gagal menyimpan log penggunaan AI:",
        logErr.message,
      );
    }

    return res.status(200).json({
      success: true,
      data: {
        reply: aiResponse.content,
        accessType: req.aiAccessType, // Informasi dari aiGate (free/premium)
        remainingTokens:
          req.remainingTokens !== undefined ? req.remainingTokens : "unlimited",
      },
    });
  } catch (error) {
    console.error(
      "[AI Chat Controller] Kesalahan saat memproses chat AI:",
      error,
    );
    return res.status(500).json({
      success: false,
      message: "Gagal memproses pesan AI. Silakan coba beberapa saat lagi.",
    });
  }
};

export const handleAIRecommend = async (req, res) => {
  try {
    // Ekstraksi parameter form yang diperkaya dengan konteks medan dan tujuan penggunaan
    const { budgetMin, budgetMax, needType, passengers, priority, selectedColor } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!budgetMin || !budgetMax) {
      return res.status(400).json({
        success: false,
        message: "Parameter budgetMin dan budgetMax wajib diisi untuk melakukan rekomendasi.",
      });
    }

    // Ambil seluruh data katalog mobil aktif dari MongoDB via Mongoloquent QueryBuilder
    const allCars = await Car.where("status", "active").get();

    if (!allCars || allCars.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Katalog mobil kosong. Silakan lakukan seeding data terlebih dahulu.",
      });
    }

    const catalogDetails = allCars
      .map(
        (car) =>
          `- ID: ${car._id}, Nama: ${car.name}, Brand: ${car.brand}, Tipe: ${car.type}, Harga: Rp ${(Number(car.basePrice) || 0).toLocaleString("id-ID")}, Kapasitas: ${car.specs?.seats || 5} kursi, Transmisi: ${car.specs?.transmission || "N/A"}, Mesin: ${car.specs?.engine || "N/A"}`,
      )
      .join("\n");

    // Inisialisasi model ChatGroq via LangChain (Model Groq Aktif: llama-3.3-70b-versatile)
    const recommendationModel = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "openai/gpt-oss-120b",
      temperature: 0.2,
    });

    const budgetLabel = `Rp ${Number(budgetMin).toLocaleString("id-ID")} - Rp ${Number(budgetMax).toLocaleString("id-ID")}`;
    const seatsLabel = passengers ? `${passengers} penumpang` : "Bebas";
    const needLabel = needType || "Mobilitas harian";
    const priorityLabel = priority || "Kenyamanan dan efisiensi";
    const colorLabel = selectedColor || "Bebas";

    // Prompt yang diperkuat dengan parameter analitik mendalam
    const systemPrompt = new SystemMessage(
      `Kamu adalah pakar konsultan otomotif untuk platform "RAC AI".\n` +
      `Pengguna mencari rekomendasi mobil dengan kriteria:\n` +
      `- Range Budget: ${budgetLabel}\n` +
      `- Kebutuhan: ${needLabel}\n` +
      `- Jumlah penumpang: ${seatsLabel}\n` +
      `- Prioritas: ${priorityLabel}\n` +
      `- Preferensi warna: ${colorLabel}\n\n` +
      `Daftar Katalog Mobil (status active):\n` +
      `${catalogDetails}\n\n` +
      `Pilih 1–3 mobil dari katalog di atas yang paling sesuai budget dan kebutuhan.\n` +
      `Output JSON murni array saja, format:\n` +
      `[\n  {\n    "carId": "id_dari_katalog",\n    "matchScore": 95,\n    "aiReason": "Alasan singkat...",\n    "selectedColor": "${colorLabel !== "Bebas" ? colorLabel : "opsional"}"\n  }\n]`,
    );

    const userRequest = new HumanMessage(
      "Berikan rekomendasi mobil terbaik berdasarkan parameter lengkap tersebut.",
    );

    // Eksekusi pemanggilan model AI via LangChain
    const rawAiResponse = await recommendationModel.invoke([
      systemPrompt,
      userRequest,
    ]);

    let parsedRecommendations = [];
    try {
      const cleanJsonString = rawAiResponse.content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      parsedRecommendations = JSON.parse(cleanJsonString);
    } catch (parseError) {
      console.warn(
        "[AI Recommend] Gagal memparsing JSON dari LLM, menggunakan respons mentah:",
        rawAiResponse.content,
      );
      parsedRecommendations = [{ rawInsight: rawAiResponse.content }];
    }

    // Catat log penggunaan secara aman
    try {
      const db = getDB();
      if (db) {
        const validUserId =
          userId && ObjectId.isValid(userId)
            ? new ObjectId(userId)
            : String(userId || "anonymous");
        await db.collection("ai_usage_logs").insertOne({
          userId: validUserId,
          feature: "recommend",
          tokensUsed: 1,
          metadata: {
            criteria: { budgetMin, budgetMax, needType, passengers, priority, selectedColor },
            recommendedCount: Array.isArray(parsedRecommendations)
              ? parsedRecommendations.length
              : 1,
          },
          createdAt: new Date(),
        });
      }
    } catch (logErr) {
      console.warn(
        "[AI Controller] Gagal menyimpan log penggunaan rekomendasi:",
        logErr.message,
      );
    }

    return res.status(200).json({
      success: true,
      data: {
        recommendations: parsedRecommendations,
        accessType: req.aiAccessType,
        remainingTokens:
          req.remainingTokens !== undefined ? req.remainingTokens : "unlimited",
      },
    });
  } catch (error) {
    console.error(
      "[AI Recommend Controller] Kesalahan saat memproses rekomendasi:",
      error,
    );
    return res.status(500).json({
      success: false,
      message:
        "Gagal menghasilkan rekomendasi mobil. Silakan coba beberapa saat lagi.",
    });
  }
};

export const handleCreditSimulation = async (req, res) => {
  try {
    const { carPrice, downPayment, tenorMonths, interestRatePerYear } =
      req.body;
    const userId = req.user?.id || req.user?._id;

    // Validasi input wajib
    if (!carPrice || !downPayment || !tenorMonths) {
      return res.status(400).json({
        success: false,
        message:
          "Parameter carPrice, downPayment, dan tenorMonths wajib diisi.",
      });
    }

    // Suku bunga default leasing jika tidak diisi (misal: 7.5% per tahun)
    const rate = interestRatePerYear ? Number(interestRatePerYear) : 7.5;

    // Eksekusi Perhitungan Matematis secara Deterministik (100% Akurat)
    let calculationResult;
    try {
      calculationResult = calculateCreditSimulation(
        Number(carPrice),
        Number(downPayment),
        Number(tenorMonths),
        rate,
      );
    } catch (mathError) {
      return res.status(400).json({
        success: false,
        message: mathError.message,
      });
    }

    // Minta Analisis Tambahan dari AI (Groq + LangChain) untuk Insight Keuangan
    const aiModel = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "openai/gpt-oss-120b",
      temperature: 0.3,
    });

    const systemPrompt = new SystemMessage(
      `Kamu adalah penasihat keuangan otomotif profesional.\n` +
      `Berikut adalah hasil kalkulasi kredit mobil:\n` +
      `- Harga OTR: Rp ${calculationResult.onTheRoadPrice.toLocaleString("id-ID")}\n` +
      `- Uang Muka (DP): Rp ${calculationResult.downPayment.toLocaleString("id-ID")}\n` +
      `- Pokok Pinjaman: Rp ${calculationResult.loanAmount.toLocaleString("id-ID")}\n` +
      `- Tenor: ${calculationResult.tenorMonths} bulan\n` +
      `- Cicilan per Bulan: Rp ${calculationResult.monthlyInstallment.toLocaleString("id-ID")}\n\n` +
      `Berikan analisis singkat dalam format JSON murni berstruktur:\n` +
      `{\n  "financialHealthStatus": "Aman / Perlu Perhatian / Berisiko",\n  "insightText": "Paragraf pendek saran finansial rasional..."\n}`,
    );

    const userMsg = new HumanMessage(
      "Berikan insight finansial untuk simulasi cicilan ini.",
    );
    const aiResponse = await aiModel.invoke([systemPrompt, userMsg]);

    let parsedInsight = {
      financialHealthStatus: "Aman",
      insightText: aiResponse.content,
    };

    try {
      const cleanJson = aiResponse.content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      parsedInsight = JSON.parse(cleanJson);
    } catch (e) {
      // Fallback jika respons LLM tidak murni JSON
    }

    // Catat penggunaan token ke ai_usage_logs (Sesuai ERD)
    try {
      const db = getDB();
      if (db && userId) {
        const validUserId = ObjectId.isValid(userId)
          ? new ObjectId(userId)
          : String(userId);
        await db.collection("ai_usage_logs").insertOne({
          userId: validUserId,
          feature: "credit",
          tokensUsed: 1,
          metadata: { carPrice, tenorMonths, monthlyInstallment: calculationResult.monthlyInstallment },
          createdAt: new Date(),
        });
      }
    } catch (logErr) {
      console.warn("[AI Controller] Gagal simpan log credit:", logErr.message);
    }

    // Kirim respons terstruktur ke Frontend
    return res.status(200).json({
      success: true,
      data: {
        calculation: calculationResult,
        aiFinancialInsight: parsedInsight,
        accessType: req.aiAccessType,
        remainingTokens:
          req.remainingTokens !== undefined ? req.remainingTokens : "unlimited",
      },
    });
  } catch (error) {
    console.error(
      "[Credit Simulation Controller] Gagal memproses simulasi kredit:",
      error,
    );
    return res.status(500).json({
      success: false,
      message: "Kesalahan internal server pada simulasi kredit.",
    });
  }
};
