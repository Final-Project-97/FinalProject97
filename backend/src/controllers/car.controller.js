import Car from "../models/car.model.js";

export const getCars = async (req, res) => {
  try {
    const { brand, type } = req.query;

    let query = Car.where("status", "active");
    if (brand) query = query.where("brand", "like", brand);
    if (type) query = query.where("type", "like", type);

    const cars = await query.get();

    return res.status(200).json({
      success: true,
      count: cars.length,
      data: cars,
    });
  } catch (error) {
    console.error("[cars/list]", error);
    return res.status(500).json({ success: false, message: "Kesalahan internal server" });
  }
};

export const getTopCar = async (req, res) => {
  try {
    const topCar = await Car.where("isTopProduct", true)
      .where("status", "active")
      .first();

    if (!topCar) {
      return res.status(404).json({ success: false, message: "Top product belum di-set" });
    }

    return res.status(200).json({ success: true, data: topCar });
  } catch (error) {
    console.error("[cars/top]", error);
    return res.status(500).json({ success: false, message: "Kesalahan internal server" });
  }
};

export const getCarById = async (req, res) => {
  try {
    const { id } = req.params;

    const car =
      id.length === 24
        ? await Car.where("_id", id).first()
        : await Car.where("slug", id).first();

    if (!car) {
      return res.status(404).json({ success: false, message: "Mobil tidak ditemukan" });
    }

    return res.status(200).json({ success: true, data: car });
  } catch (error) {
    console.error("[cars/detail]", error);
    return res.status(500).json({ success: false, message: "Kesalahan internal server" });
  }
};