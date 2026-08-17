import dotenv from "dotenv";
import fs from "fs";
import { connectDB } from "../src/database.js";
import Car from "../models/car.model.js";

dotenv.config();

const seedLocalCarsPipeline = async () => {
  try {
    console.log("[Seed] Memulai proses seeding mobil lokal...");

    // Hubungkan ke database MongoDB
    await connectDB();

    // Membaca file JSON pengayaan lokal
    const filePath = "./config/car-enrichment.json";
    if (!fs.existsSync(filePath)) {
      throw new Error(`File konfigurasi tidak ditemukan di path: ${filePath}`);
    }

    const rawData = fs.readFileSync(filePath, "utf-8");
    const carsDataMap = JSON.parse(rawData);
    const slugs = Object.keys(carsDataMap);

    console.log(
      `[Seed] Ditemukan ${slugs.length} data mobil di dalam file konfigurasi.`,
    );

    // Iterasi dan simpan ke database menggunakan Mongoloquent (Upsert berdasarkan slug)
    for (const slug of slugs) {
      const carInfo = carsDataMap[slug];

      const carDocument = {
        name: carInfo.name,
        brand: carInfo.brand,
        slug: slug,
        type: carInfo.type,
        basePrice: carInfo.basePrice,
        description: carInfo.description,
        specs: carInfo.specs || {},
        colors: carInfo.colors || [],
        image360Url: carInfo.image360Url || "",
        thumbnailUrl: carInfo.thumbnailUrl || "",
        isTopProduct: carInfo.isTopProduct || false,
        status: "active",
        externalSource: "local_seed",
        externalId: `seed-${slug}`,
        syncedAt: new Date(),
        enrichedAt: new Date(),
      };

      // Operasi pembaruan atau pembuatan data baru di MongoDB
      await Car.updateOrCreate({ slug: slug }, carDocument);

      console.log(`[Seed] Berhasil menyinkronkan: ${carInfo.name} (${slug})`);
    }

    console.log(
      "[Seed] Selesai! Seluruh data katalog mobil berhasil dimasukkan ke database.",
    );
    process.exit(0);
  } catch (error) {
    console.error("[Seed] Terjadi kegagalan pada proses injeksi data:", error);
    process.exit(1);
  }
};

seedLocalCarsPipeline();
