import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { carRoutes } from "./routes/car.routes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Global
app.use(express.json());
app.use(cors());
app.use("/api/cars", carRoutes);

// Endpoint Pemeriksaan Kesehatan Server (Health Check)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "SUCCESS",
    message: "Backend RAC AI aktif dan berjalan normal!",
    timestamp: new Date().toISOString(),
  });
});

// Menyalakan Server
app.listen(PORT, () => {
  console.log(`[Server] Berjalan sukses di port ${PORT}`);
});
