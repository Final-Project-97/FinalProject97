import { getDB } from "../database.js";
import { Wishlist } from "../models/wishlist.model.js";
import { ObjectId } from "mongodb";

// 1. GET: Mengambil daftar wishlist milik user yang sedang login
export const getUserWishlist = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    const db = getDB();
    if (!db) {
      return res
        .status(500)
        .json({ success: false, message: "Koneksi database belum tersedia" });
    }

    const matchQuery =
      userId && ObjectId.isValid(userId)
        ? { userId: new ObjectId(userId) }
        : { userId: String(userId || "") };

    const wishlists = await db
      .collection("wishlists")
      .aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: "cars",
            localField: "carId",
            foreignField: "_id",
            as: "carDetails",
          },
        },
        { $unwind: { path: "$carDetails", preserveNullAndEmptyArrays: true } },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    return res.status(200).json({
      success: true,
      count: wishlists.length,
      data: wishlists,
    });
  } catch (error) {
    console.error(
      "[Wishlist Controller] Gagal mengambil data wishlist:",
      error,
    );
    return res
      .status(500)
      .json({ success: false, message: "Kesalahan internal server" });
  }
};

// 2. POST: Menambahkan mobil ke dalam wishlist
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { carId, selectedColor, notes, source, matchScore, aiReason } =
      req.body;

    if (!carId) {
      return res.status(400).json({
        success: false,
        message: "ID mobil (carId) wajib disertakan.",
      });
    }

    const db = getDB();
    if (!db) {
      return res
        .status(500)
        .json({ success: false, message: "Koneksi database belum tersedia" });
    }

    const userObjId =
      userId && ObjectId.isValid(userId)
        ? new ObjectId(userId)
        : String(userId || "anonymous");
    const carObjId =
      carId && ObjectId.isValid(carId) ? new ObjectId(carId) : String(carId);

    const existing = await db.collection("wishlists").findOne({
      userId: userObjId,
      carId: carObjId,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Mobil ini sudah ada di dalam wishlist Anda.",
      });
    }

    const newWishlist = {
      userId: userObjId,
      carId: carObjId,
      selectedColor: selectedColor || "",
      notes: notes || "",
      source: source || "manual",
      matchScore: matchScore || null,
      aiReason: aiReason || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("wishlists").insertOne(newWishlist);

    return res.status(201).json({
      success: true,
      message: "Berhasil menambahkan mobil ke wishlist.",
      data: { _id: result.insertedId, ...newWishlist },
    });
  } catch (error) {
    console.error("[Wishlist Controller] Gagal menambah wishlist:", error);
    return res
      .status(500)
      .json({ success: false, message: "Kesalahan internal server" });
  }
};

// 3. DELETE: Menghapus item dari wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;

    const db = getDB();
    if (!db) {
      return res
        .status(500)
        .json({ success: false, message: "Koneksi database belum tersedia" });
    }

    const wishlistObjId =
      id && ObjectId.isValid(id) ? new ObjectId(id) : String(id);
    const userObjId =
      userId && ObjectId.isValid(userId)
        ? new ObjectId(userId)
        : String(userId || "anonymous");

    const deleteResult = await db.collection("wishlists").deleteOne({
      _id: wishlistObjId,
      userId: userObjId,
    });

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Item wishlist tidak ditemukan atau bukan milik Anda.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Item berhasil dihapus dari wishlist.",
    });
  } catch (error) {
    console.error("[Wishlist Controller] Gagal menghapus wishlist:", error);
    return res
      .status(500)
      .json({ success: false, message: "Kesalahan internal server" });
  }
};
