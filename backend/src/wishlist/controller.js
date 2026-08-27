import { Wishlist } from '../models/index.js';
import Car from "../models/car.model.js";
import { createWishlistSchema, updateWishlistSchema } from './validation.js';

async function attachCarSummary(items) {
  const enriched = [];
  for (const item of items) {
    const car = await Car.where('_id', item.carId).first();
    enriched.push({
      ...item,
      car: car
        ? {
          _id: car._id,
          name: car.name,
          brand: car.brand,
          slug: car.slug,
          thumbnailUrl: car.thumbnailUrl,
          basePrice: car.basePrice,
        }
        : null,
    });
  }
  return enriched;
}

export async function listWishlist(req, res) {
  try {
    const userId = String(req.user._id);
    const items = await Wishlist.where('userId', userId)
      .orderBy('createdAt', 'desc')
      .get();

    return res.status(200).json({
      success: true,
      count: items.length,
      data: await attachCarSummary(items),
    });
  } catch (err) {
    console.error('[wishlist/list]', err);
    return res.status(500).json({ success: false, message: 'Kesalahan internal server' });
  }
}

export async function createWishlist(req, res) {
  try {
    const parsed = createWishlistSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: 'Validasi gagal' });
    }

    const userId = String(req.user._id);
    const { carId, selectedColor, notes, source, matchScore, aiReason } = parsed.data;

    const car = await Car.where('_id', carId).first();
    if (!car) {
      return res.status(404).json({ success: false, message: 'Mobil tidak ditemukan' });
    }

    const existing = await Wishlist.where('userId', userId).where('carId', carId).first();
    if (existing) {
      return res.status(409).json({
        success: false,
        code: 'WISHLIST_EXISTS',
        message: 'Mobil sudah ada di wishlist',
      });
    }

    const item = await Wishlist.create({
      userId,
      carId,
      selectedColor: selectedColor || '',
      notes: notes || '',
      source: source || 'manual',
      matchScore: matchScore ?? null,
      aiReason: aiReason || '',
    });

    return res.status(201).json({ success: true, data: item });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({
        success: false,
        code: 'WISHLIST_EXISTS',
        message: 'Mobil sudah ada di wishlist',
      });
    }
    console.error('[wishlist/create]', err);
    return res.status(500).json({ success: false, message: 'Kesalahan internal server' });
  }
}

export async function updateWishlist(req, res) {
  try {
    const parsed = updateWishlistSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: 'Validasi gagal' });
    }

    const userId = String(req.user._id);
    const item = await Wishlist.where('_id', req.params.id).where('userId', userId).first();

    if (!item) {
      return res.status(404).json({ success: false, message: 'Wishlist tidak ditemukan' });
    }

    await Wishlist.where('_id', item._id).update(parsed.data);
    const updated = await Wishlist.where('_id', item._id).first();

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error('[wishlist/update]', err);
    return res.status(500).json({ success: false, message: 'Kesalahan internal server' });
  }
}

export async function deleteWishlist(req, res) {
  try {
    const userId = String(req.user._id);
    const item = await Wishlist.where('_id', req.params.id).where('userId', userId).first();

    if (!item) {
      return res.status(404).json({ success: false, message: 'Wishlist tidak ditemukan' });
    }

    await Wishlist.destroy(item._id);

    return res.status(200).json({ success: true, message: 'Wishlist dihapus' });
  } catch (err) {
    console.error('[wishlist/delete]', err);
    return res.status(500).json({ success: false, message: 'Kesalahan internal server' });
  }
}