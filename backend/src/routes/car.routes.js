import { Router } from "express";
import {
  getCars,
  getTopCar,
  getCarById,
} from "../controllers/car.controller.js";

const router = Router();

router.get("/", getCars); // GET /api/cars
router.get("/top", getTopCar); // GET /api/cars/top
router.get("/:id", getCarById); // GET /api/cars/:id (bisa pakai _id atau slug)

export const carRoutes = router;
