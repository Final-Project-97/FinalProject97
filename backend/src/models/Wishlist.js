import BaseModel from './BaseModel.js';

class Wishlist extends BaseModel {
  // auto collection: "wishlists"
  static $schema = {
    userId: String,
    carId: String,
    selectedColor: String,
    notes: String,
    source: { type: String, default: 'manual' }, // manual | recommendation | detail
    matchScore: Number,
    aiReason: String,
  };
}

export default Wishlist;