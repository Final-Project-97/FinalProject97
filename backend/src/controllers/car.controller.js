import { Car } from "../models/car.model.js";

export const getCars = async (req, res) => {
  try {
    const { brand, type } = req.query;
    let query = ("status", "active");

    if (brand) query.brand = new RegExp("brand", "regex", brand); // Pencarian case-insensitive
    if (type) query.type = new RegExp("type", "regex", type);

    const cars = await Car.where(query).get();
    return res.status(200).json({
      success: true,
      count: cars.length,
      data: cars,
    });
  } catch (error) {
    console.log("[Controllor] gagal mengambil daftar car: ", error);
    return res
      .status(500)
      .json({ success: false, message: "Kesalahan internal server" });
  }
};

// ini untuk home, 1 top pruduction si car nya bisa di gunakan untu yang 360

export const getTopCar = async (req, res) => {
  try {
    const topCar = await Car.where("isTopProduct", true)
      .where("status", "active")
      .first();

    if (!topCar) {
      return res
        .status(404)
        .json({ success: false, message: "Top product tidak ditemukan" });
    }
    return res.status(200).json({
      success: true,
      data: topCar,
    });
  } catch (error) {
    console.log("[Controllor] gagal mengambil daftar car: ", error);
    return res
      .status(500)
      .json({ success: false, message: "Kesalahan internal server" });
  }
};

export const getCarById = async (req, res) => {
  try {
    const { id } = req.params;

    // pencarian via ID ObjectId atau via custom slug
    let car = null;
    if (id.length === 24) {
      car = await Car.find(id);
    } else {
      car = await Car.where("slug", id).first();
    }

    if (!car) {
      return res
        .status(404)
        .json({ success: false, message: "Mobil tidak ditemukan" });
    }

    return res.status(200).json({
      success: true,
      data: car,
    });
  } catch (error) {
    console.error("[Controller] Gagal mengambil detail mobil:", error);
    return res
      .status(500)
      .json({ success: false, message: "Kesalahan internal server" });
  }
};
