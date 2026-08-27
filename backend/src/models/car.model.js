// backend/src/models/car.model.js
import BaseModel from './BaseModel.js';

export default class Car extends BaseModel {
  static $schema = {
    name: String,
    brand: String,
    slug: String,
    type: String,
    basePrice: Number,
    description: String,
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
        availability: String,
      },
    ],
    image360Url: String,
    thumbnailUrl: String,
    isTopProduct: { type: Boolean, default: false },
    status: { type: String, default: 'active' },
    externalSource: { type: String, default: 'carapi' },
    externalId: String,
    syncedAt: Date,
    enrichedAt: Date,
  };
}