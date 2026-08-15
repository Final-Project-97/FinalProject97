import { Model } from "mongoloquent";

export class Car extends Model {
  static get collection() {
    return "cars";
  }

  // validasi
  static get schema() {
    return {
      name: { type: String, required: true }, // Contoh: "Toyota Camry XLE"
      brand: { type: String, required: true }, // Contoh: "Toyota"
      slug: { type: String, unique: true, required: true }, // URL-friendly unique identifier
      type: { type: String, required: true }, // SUV | MPV | Sedan | Hatchback
      basePrice: { type: Number, required: true }, // Harga dalam format Rupiah (IDR)
      description: String, // Deskripsi singkat mobil
      specs: {
        engine: String,
        transmission: String,
        fuelType: String,
        seats: Number,
      },
      colors: [
        {
          name: String,
          hexCode: String,
          imageUrl: String,
          availability: { type: String, enum: ["available", "limited", "out"] },
        },
      ],
      image360Url: String, // Khusus untuk Top Product (CI360)
      thumbnailUrl: String,
      isTopProduct: { type: Boolean, default: false }, // Penanda mobil unggulan di Homepage
      status: { type: String, default: "active", enum: ["active", "inactive"] },
      externalSource: { type: String, default: "carapi" },
      externalId: String,
      syncedAt: Date,
      enrichedAt: Date,
    };
  }

  static scopeTopProduct(query) {
    return query.where("isTopProduct", true);
  }
}
