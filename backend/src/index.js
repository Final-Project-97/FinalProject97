import './config/database.js';
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./database.js";
import { carRoutes } from "./routes/car.routes.js";
import { aiRoutes } from "./routes/ai.routes.js";
import { authRoutes } from "./auth/routes.js";
import { showroomRoutes } from "./showrooms/routes.js";
import { wishlistRoutes } from "./wishlist/routes.js";
import { subscriptionRoutes } from "./subscription/routes.js";
import { startExpiryCron } from "./subscription/expiry.job.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Global
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
}));

// Registrasi Rute API
app.use("/api/cars", carRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/showrooms", showroomRoutes);
app.use("/api/subscription", subscriptionRoutes);

// Endpoint Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "SUCCESS",
    message: "Backend RAC AI aktif dan berjalan normal!",
    timestamp: new Date().toISOString(),
  });
});

// Menyalakan Server & Menghubungkan DB
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[Server] Berjalan sukses di port ${PORT}`);
      startExpiryCron();
    });
  } catch (error) {
    console.error("[Server] Gagal menyalakan server:", error);
    process.exit(1);
  }
};

startServer();
